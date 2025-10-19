import { HttpClient } from "./core/client";
import { AuthManager } from "./auth/auth-manager";
import { HealthService } from "./services/health-service";
import { TaskService } from "./services/task-service";
import { RoomService } from "./services/room-service";
import { EvaluationService } from "./services/evaluation-service";
import { ApiError, ErrorCode } from "./core/errors";
import type { Config } from "./core/config";
import { isBrowser } from "./utils/environment";

const API_PREFIX = "/api/v1";

export interface ApiOptions extends Partial<Config> {
  baseURL?: string;
  debug?: boolean;
}

export class Api {
  private client: HttpClient;
  private authManager: AuthManager;
  private destroyed = false;

  public readonly health: HealthService;
  public readonly task: TaskService;
  public readonly rooms: RoomService;
  public readonly evaluation: EvaluationService;

  constructor(options: ApiOptions = {}) {
    const baseURL: string | undefined =
      options.baseURL ||
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
      (typeof process !== "undefined" && process.env?.API_URL) ||
      (isBrowser ? window.location.origin : "http://localhost");

    this.client = new HttpClient({
      ...options,
      baseURL,
    });

    this.authManager = new AuthManager();

    this.health = new HealthService(this.client, `${API_PREFIX}/health`);
    this.task = new TaskService(this.client, `${API_PREFIX}/tasks`);
    this.rooms = new RoomService(this.client, `${API_PREFIX}/rooms`);
    this.evaluation = new EvaluationService(
      this.client,
      `${API_PREFIX}/evaluation`
    );

    this.setupInterceptors(options.debug);
    this.setupAuthListeners();
  }

  private setupInterceptors(debug = false): void {
    this.client.interceptors.request.use(
      (config) => {
        const authHeaders = this.authManager.getAuthHeader();
        config.headers = {
          ...config.headers,
          ...authHeaders,
        };

        if (debug) {
          console.debug(`[API] ${config.method} ${config.url}`, {
            params: config.params,
            data: config.data,
            headers: config.headers,
          });
        }

        return config;
      },
      (error) => {
        if (debug) {
          console.error("[API] Request error:", error);
        }
        throw error;
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        if (debug) {
          console.debug(`[API] Response ${response.status}:`, {
            data: response.data,
            duration: response.duration,
            cached: response.cached,
          });
        }
        return response;
      },
      (error) => {
        if (debug) {
          console.error("[API] Response error:", error);
        }

        if (
          error instanceof ApiError &&
          error.code === ErrorCode.UNAUTHORIZED
        ) {
          this.authManager.handleUnauthorized();
        }

        throw error;
      }
    );
  }

  private setupAuthListeners(): void {
    this.authManager.onUnauthorized(() => {
      this.client.cancelAll();
      this.client.clearCache();

      if (isBrowser && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("api:unauthorized"));
      }
    });

    this.authManager.onLogout(() => {
      this.client.clearCache();
    });
  }

  public get auth(): AuthManager {
    return this.authManager;
  }

  public get httpClient(): HttpClient {
    return this.client;
  }

  public setDebug(enabled: boolean): void {
    this.setupInterceptors(enabled);
  }

  public cancelAll(): void {
    this.client.cancelAll();
  }

  public clearCache(): void {
    this.client.clearCache();
  }

  public cacheSize(): number {
    return this.client.cacheSize();
  }

  public destroy(): void {
    if (this.destroyed) return;

    this.destroyed = true;
    this.client.cancelAll();
    this.client.clearCache();
    this.authManager.destroy();
  }

  public isDestroyed(): boolean {
    return this.destroyed;
  }
}

let apiInstance: Api | null = null;

export function createApi(options?: ApiOptions): Api {
  if (!apiInstance) {
    apiInstance = new Api(options);
  }
  return apiInstance;
}

export function getApi(): Api {
  if (!apiInstance) {
    apiInstance = new Api();
  }
  return apiInstance;
}

export function resetApi(): void {
  if (apiInstance) {
    apiInstance.destroy();
    apiInstance = null;
  }
}
