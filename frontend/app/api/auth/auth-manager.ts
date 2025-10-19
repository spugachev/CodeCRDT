import { EventEmitter } from "../utils/event-emitter";
import { getStorage } from "../utils/storage";
import { isBrowser } from "../utils/environment";

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  expiresAt?: Date;
  tokenType?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: AuthToken | null;
  user?: unknown;
}

export class AuthManager extends EventEmitter {
  private static readonly TOKEN_KEY = "auth_token";
  private static readonly REFRESH_TOKEN_KEY = "refresh_token";
  private storage = getStorage();
  private state: AuthState = {
    isAuthenticated: false,
    token: null,
  };
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    super();
    this.loadTokens();
  }

  private loadTokens(): void {
    const accessToken = this.storage.getItem(AuthManager.TOKEN_KEY);
    const refreshToken = this.storage.getItem(AuthManager.REFRESH_TOKEN_KEY);

    if (accessToken) {
      this.state = {
        isAuthenticated: true,
        token: {
          accessToken,
          refreshToken: refreshToken || undefined,
        },
      };
    }
  }

  public getAccessToken(): string | null {
    return this.state.token?.accessToken || null;
  }

  public getRefreshToken(): string | null {
    return this.state.token?.refreshToken || null;
  }

  public getAuthHeader(): Record<string, string> {
    const token = this.getAccessToken();
    if (!token) return {};

    const tokenType = this.state.token?.tokenType || "Bearer";
    return {
      Authorization: `${tokenType} ${token}`,
    };
  }

  public setToken(token: AuthToken): void {
    this.state = {
      isAuthenticated: true,
      token,
    };

    this.storage.setItem(AuthManager.TOKEN_KEY, token.accessToken);
    if (token.refreshToken) {
      this.storage.setItem(AuthManager.REFRESH_TOKEN_KEY, token.refreshToken);
    }

    this.emit("auth:token-updated", token);
  }

  public clearToken(): void {
    this.state = {
      isAuthenticated: false,
      token: null,
    };

    this.storage.removeItem(AuthManager.TOKEN_KEY);
    this.storage.removeItem(AuthManager.REFRESH_TOKEN_KEY);

    this.emit("auth:logout");
  }

  public isAuthenticated(): boolean {
    if (!this.state.token) return false;

    if (this.state.token.expiresAt) {
      const now = new Date();
      if (now >= this.state.token.expiresAt) {
        this.clearToken();
        return false;
      }
    }

    return this.state.isAuthenticated;
  }

  public async refreshToken(
    refreshFn: (token: string) => Promise<AuthToken>
  ): Promise<void> {
    // Prevent concurrent refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    this.refreshPromise = (async () => {
      try {
        const newToken = await refreshFn(refreshToken);
        this.setToken(newToken);
        this.emit("auth:token-refreshed", newToken);
      } catch (error) {
        this.clearToken();
        this.emit("auth:refresh-failed", error);
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  public onUnauthorized(callback: () => void): () => void {
    this.on("auth:unauthorized", callback);
    return () => this.off("auth:unauthorized", callback);
  }

  public onTokenUpdated(callback: (token: AuthToken) => void): () => void {
    this.on("auth:token-updated", callback);
    return () => this.off("auth:token-updated", callback);
  }

  public onLogout(callback: () => void): () => void {
    this.on("auth:logout", callback);
    return () => this.off("auth:logout", callback);
  }

  public handleUnauthorized(): void {
    this.clearToken();
    this.emit("auth:unauthorized");

    // Dispatch browser event if in browser environment
    if (isBrowser && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
  }

  public destroy(): void {
    this.removeAllListeners();
    this.refreshPromise = null;
  }
}
