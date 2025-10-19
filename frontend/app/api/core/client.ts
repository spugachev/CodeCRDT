/**
 * HTTP client with retry, caching, and interceptor support
 */

import { DEFAULT_CONFIG } from "./config";
import type { Config, Request, Response, RetryConfig } from "./config";
import { ApiError, ErrorCode } from "./errors";
import {
  InterceptorManager,
  defaultRequestInterceptor,
  defaultResponseInterceptor,
} from "./interceptors";
import { Cache } from "./cache";
import { fetch, AbortController } from "../utils/compat";

export class HttpClient {
  private config: Config;
  private cache: Cache;
  private controllers: Map<string, InstanceType<typeof AbortController>>;

  public interceptors: {
    request: InterceptorManager<Request>;
    response: InterceptorManager<Response>;
  };

  constructor(config: Partial<Config> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      headers: {
        ...DEFAULT_CONFIG.headers,
        ...config.headers,
      },
    } as Config;

    this.cache = new Cache(this.config.cache?.maxSize);
    this.controllers = new Map();

    this.interceptors = {
      request: new InterceptorManager<Request>(),
      response: new InterceptorManager<Response>(),
    };

    this.setupDefaultInterceptors();
  }

  private setupDefaultInterceptors(): void {
    this.interceptors.request.use(
      defaultRequestInterceptor.fulfilled,
      defaultRequestInterceptor.rejected
    );

    this.interceptors.response.use(
      defaultResponseInterceptor.fulfilled,
      defaultResponseInterceptor.rejected
    );
  }

  private buildURL(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const url = new URL(endpoint, this.config.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private createController(
    requestId: string
  ): InstanceType<typeof AbortController> {
    const existing = this.controllers.get(requestId);
    if (existing) {
      existing.abort();
    }

    const controller = new AbortController();
    this.controllers.set(requestId, controller);

    return controller;
  }

  private async withRetry<T>(
    fn: () => Promise<T>,
    config?: RetryConfig | false
  ): Promise<T> {
    if (config === false || !config?.enabled) {
      return fn();
    }

    const retry = config || this.config.retry;
    if (!retry?.enabled) {
      return fn();
    }

    let lastError: unknown;
    let delay = retry.delay || 1000;
    const maxAttempts = retry.maxAttempts || 3;
    const maxDelay = retry.maxDelay || 10000;
    const backoff = retry.backoff || "exponential";

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Don't retry certain errors
        if (error instanceof ApiError) {
          if (
            error.code === ErrorCode.CANCELLED ||
            error.code === ErrorCode.UNAUTHORIZED ||
            error.code === ErrorCode.FORBIDDEN ||
            error.code === ErrorCode.VALIDATION_ERROR
          ) {
            throw error;
          }
        }

        if (attempt < maxAttempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));

          if (backoff === "exponential") {
            delay = Math.min(delay * 2, maxDelay);
          } else {
            delay = Math.min(delay + (retry.delay || 1000), maxDelay);
          }
        }
      }
    }

    throw lastError;
  }

  private async performRequest<T>(
    method: string,
    endpoint: string,
    config?: Request
  ): Promise<Response<T>> {
    const requestConfig: Request = {
      ...config,
      method,
      headers: {
        ...this.config.headers,
        ...config?.headers,
      },
    };

    const body = config?.data ? JSON.stringify(config.data) : undefined;
    const processedConfig =
      await this.interceptors.request.execute<Request>(requestConfig);
    const url = this.buildURL(endpoint, processedConfig.params);

    const requestId = processedConfig.id!;
    const controller = this.createController(requestId);

    const timeout = processedConfig.timeout ?? this.config.timeout;
    const timeoutId = timeout
      ? setTimeout(() => {
          controller.abort();
          this.controllers.delete(requestId);
        }, timeout)
      : undefined;

    try {
      const fetchConfig: RequestInit = {
        method: processedConfig.method,
        headers: processedConfig.headers,
        signal: controller.signal,
        body,
      };

      const response = await fetch(url, fetchConfig);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      let data: T;
      const contentType = response.headers.get("content-type");

      try {
        if (contentType?.includes("application/json")) {
          data = await response.json();
        } else if (contentType?.includes("text/")) {
          data = (await response.text()) as unknown as T;
        } else if (response.status === 204) {
          data = null as unknown as T;
        } else {
          data = (await response.blob()) as unknown as T;
        }
      } catch (parseError) {
        throw new ApiError(
          "Failed to parse response",
          ErrorCode.UNKNOWN,
          response.status,
          parseError
        );
      }

      if (!response.ok) {
        throw ApiError.fromResponse(response, data);
      }

      const apiResponse: Response<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config: processedConfig,
      };

      return await this.interceptors.response.execute<Response<T>>(apiResponse);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        if (timeout && timeoutId) {
          throw new ApiError("Request timeout", ErrorCode.TIMEOUT);
        }
        throw new ApiError("Request was cancelled", ErrorCode.CANCELLED);
      }
      throw ApiError.from(error);
    } finally {
      this.controllers.delete(requestId);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  public async request<T = unknown>(
    method: string,
    endpoint: string,
    config?: Request
  ): Promise<Response<T>> {
    const cacheConfig =
      config?.cache !== false ? config?.cache || this.config.cache : null;

    if (method === "GET" && cacheConfig?.enabled) {
      const cacheKey = Cache.createKey(
        method,
        endpoint,
        config?.params,
        cacheConfig
      );
      const cachedResponse = this.cache.get<Response<T>>(cacheKey);

      if (cachedResponse) {
        return { ...cachedResponse, cached: true };
      }

      const response = await this.withRetry(
        () => this.performRequest<T>(method, endpoint, config),
        config?.retry
      );

      this.cache.set(cacheKey, response, cacheConfig.ttl || 300000);
      return response;
    }

    return this.withRetry(
      () => this.performRequest<T>(method, endpoint, config),
      config?.retry
    );
  }

  public get<T = unknown>(
    endpoint: string,
    config?: Request
  ): Promise<Response<T>> {
    return this.request<T>("GET", endpoint, config);
  }

  public post<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: Request
  ): Promise<Response<T>> {
    return this.request<T>("POST", endpoint, { ...config, data });
  }

  public put<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: Request
  ): Promise<Response<T>> {
    return this.request<T>("PUT", endpoint, { ...config, data });
  }

  public patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: Request
  ): Promise<Response<T>> {
    return this.request<T>("PATCH", endpoint, { ...config, data });
  }

  public delete<T = unknown>(
    endpoint: string,
    config?: Request
  ): Promise<Response<T>> {
    return this.request<T>("DELETE", endpoint, config);
  }

  public cancelRequest(requestId: string): void {
    const controller = this.controllers.get(requestId);
    if (controller) {
      controller.abort();
      this.controllers.delete(requestId);
    }
  }

  public cancelAll(): void {
    this.controllers.forEach((controller) => {
      try {
        controller.abort();
      } catch {
        // Ignore errors
      }
    });
    this.controllers.clear();
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public cacheSize(): number {
    return this.cache.size();
  }
}
