import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import type { Awareness } from "y-protocols/awareness";
import { Utils } from "../utils/utils";

const DEFAULT_SERVER_URL = "ws://localhost:3001/crdt";
const DEFAULT_SYNC_TIMEOUT = 15_000;
const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1_000;

export interface CRDTConnectorOptions {
  roomId: string;
  clientId: string;
  serverUrl?: string;
  roomName?: string;
  syncTimeout?: number;
  maxReconnectAttempts?: number;
}

export enum ConnectionState {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  SYNCED = "synced",
  ERROR = "error",
}

type UserState = { name: string; color: string };
type StatusEvent = { status: string };
type ConnectionError = Error & { code?: string; details?: unknown };

export class CRDTConnector {
  private doc: Y.Doc;
  private provider: HocuspocusProvider | null = null;
  private awareness: Awareness | null = null;
  private syncTimeout?: ReturnType<typeof setTimeout>;
  private reconnectTimeout?: ReturnType<typeof setTimeout>;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts: number;
  private readonly syncTimeoutMs: number;
  private readonly serverUrl: string;
  private readonly roomId: string;
  private readonly clientId: string;
  private isDestroyed = false;

  constructor(options: CRDTConnectorOptions) {
    this.doc = new Y.Doc();
    this.validateOptions(options);

    this.clientId = options.clientId;
    this.roomId = options.roomId;
    this.serverUrl =
      options.serverUrl || process.env.CRDT_SERVER_URL || DEFAULT_SERVER_URL;
    this.syncTimeoutMs = options.syncTimeout || DEFAULT_SYNC_TIMEOUT;
    this.maxReconnectAttempts =
      options.maxReconnectAttempts || MAX_RECONNECT_ATTEMPTS;
  }

  private validateOptions(options: CRDTConnectorOptions): void {
    const isWsUrl = (url: string) => {
      try {
        const u = new URL(url);
        return u.protocol === "ws:" || u.protocol === "wss:";
      } catch {
        return false;
      }
    };

    if (options.serverUrl && !isWsUrl(options.serverUrl))
      throw new Error(`Invalid server URL: ${options.serverUrl}`);
    if (options.syncTimeout && options.syncTimeout < 1000)
      throw new Error("Sync timeout must be at least 1000ms");
    if (options.maxReconnectAttempts && options.maxReconnectAttempts < 0)
      throw new Error("Max reconnect attempts must be non-negative");
  }

  async connect(): Promise<void> {
    if (this.isDestroyed) throw new Error("Connector has been destroyed");
    if (this.isConnected()) return;

    this.setConnectionState(ConnectionState.CONNECTING);

    try {
      await this.establishConnection();
      await this.waitForSync();
    } catch (e) {
      this.handleProviderError(e as ConnectionError);
      throw e;
    }
  }

  private async establishConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.destroyProvider();
        this.provider = new HocuspocusProvider({
          url: this.serverUrl,
          name: this.roomId,
          document: this.doc,
        });
        this.awareness = this.provider.awareness;
        this.setupAwareness();
        this.bindEvents(resolve, reject);
        this.startSyncTimeout(() =>
          this.handleProviderError(
            new Error(`Sync timeout after ${this.syncTimeoutMs}ms`),
            reject
          )
        );
      } catch (error) {
        const err = this.wrapError(error);
        this.handleProviderError(err, reject);
      }
    });
  }

  private setupAwareness(): void {
    const user: UserState = {
      name: this.clientId,
      color: Utils.generateColor(),
    };

    this.awareness?.setLocalStateField("user", user);
  }

  private bindEvents(
    resolve: () => void,
    reject: (error: Error) => void
  ): void {
    if (!this.provider) return;
    this.provider.on("status", (e: StatusEvent) => this.handleStatusChange(e));

    this.provider.on("synced", () => {
      if (this.connectionState !== ConnectionState.SYNCED) {
        this.onSyncSuccess();
        resolve();
      }
    });

    this.provider.on("disconnect", () => {
      this.handleDisconnection();
    });

    this.provider.on("error", (err: unknown) =>
      this.handleProviderError(err, reject)
    );
  }

  private onSyncSuccess(): void {
    this.clearTimeouts();
    this.setConnectionState(ConnectionState.SYNCED);
    this.reconnectAttempts = 0;
    console.debug(`[${this.clientId}] Synced`);
  }

  private handleStatusChange(event: StatusEvent): void {
    if (event.status === "connected") {
      this.setConnectionState(ConnectionState.CONNECTED);
      console.debug(`[${this.clientId}] Connected, awaiting sync...`);
    } else if (event.status === "disconnected") {
      this.handleDisconnection();
    }
  }

  private handleProviderError(
    error: unknown,
    reject?: (error: Error) => void
  ): void {
    this.clearTimeouts();
    const err = this.wrapError(error);
    console.error(`[${this.clientId}] Connection error: ${err.message}`);
    this.destroyProvider();
    if (reject) reject(err);
    this.scheduleReconnect();
  }

  private handleDisconnection(): void {
    if (
      this.connectionState === ConnectionState.DISCONNECTED ||
      this.isDestroyed
    ) {
      return;
    }

    this.clearTimeouts();
    this.setConnectionState(ConnectionState.DISCONNECTED);
    console.warn(`[${this.clientId}] Disconnected from server`);
    this.destroyProvider();
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (
      this.isDestroyed ||
      this.reconnectAttempts >= this.maxReconnectAttempts
    ) {
      this.setConnectionState(ConnectionState.ERROR);
      console.error(`[${this.clientId}] Max reconnection attempts reached`);
      return;
    }
    this.reconnectAttempts++;
    const delay = this.reconnectDelay();
    console.info(
      `[${this.clientId}] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );
    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch((e) =>
        console.error(
          `[${this.clientId}] Reconnection failed: ${this.wrapError(e).message}`
        )
      );
    }, delay);
  }

  private reconnectDelay(): number {
    const base =
      INITIAL_RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts - 1);
    const jitter = Math.random() * 0.3 * base;
    return Math.min(base + jitter, 30_000);
  }

  private startSyncTimeout(onTimeout: () => void): void {
    this.syncTimeout = setTimeout(onTimeout, this.syncTimeoutMs);
  }

  private clearTimeouts(): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = undefined;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }
  }

  private destroyProvider(): void {
    try {
      this.provider?.destroy();
    } catch (e) {
      console.warn(`[${this.clientId}] Error during provider cleanup: ${e}`);
    }
    this.provider = null;
    this.awareness = null;
  }

  private setConnectionState(state: ConnectionState): void {
    this.connectionState = state;
  }

  private wrapError(error: unknown): ConnectionError {
    if (error instanceof Error) return error as ConnectionError;
    const e = new Error(String(error)) as ConnectionError;
    e.details = error;
    return e;
  }

  async disconnect(gracePeriodMs: number = 2000): Promise<void> {
    this.isDestroyed = true;
    this.clearTimeouts();

    // Wait for any pending updates to sync before destroying
    if (gracePeriodMs > 0 && this.isSynced()) {
      console.debug(
        `[${this.clientId}] Waiting ${gracePeriodMs}ms for final sync before disconnect`
      );
      await new Promise((resolve) => setTimeout(resolve, gracePeriodMs));
    }

    this.destroyProvider();

    try {
      this.doc.destroy();
    } catch (e) {
      console.warn(`[${this.clientId}] Error during doc cleanup: ${e}`);
    }

    this.setConnectionState(ConnectionState.DISCONNECTED);
    console.debug(`[${this.clientId}] Disconnected`);
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  isConnected(): boolean {
    return (
      this.connectionState === ConnectionState.CONNECTED ||
      this.connectionState === ConnectionState.SYNCED
    );
  }

  isSynced(): boolean {
    return this.connectionState === ConnectionState.SYNCED;
  }

  private async waitForSync(timeoutMs: number = 30_000): Promise<void> {
    if (this.isSynced()) {
      return;
    }

    const startTime = Date.now();
    const checkInterval = 100;

    while (!this.isSynced() && Date.now() - startTime < timeoutMs) {
      if (this.connectionState === ConnectionState.ERROR) {
        throw new Error("Connection in ERROR state, cannot wait for sync");
      }

      await new Promise((resolve) => setTimeout(resolve, checkInterval));
    }

    if (!this.isSynced()) {
      throw new Error(
        `Sync timeout after ${timeoutMs}ms (state: ${this.connectionState})`
      );
    }
  }

  getDoc(): Y.Doc {
    return this.doc;
  }

  getAwareness(): Awareness | null {
    return this.awareness;
  }

  getClientId(): string {
    return this.clientId;
  }
}
