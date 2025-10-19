/**
 * Request and response interceptors
 */

import type { Request, Response } from "./config";
import { ApiError } from "./errors";

export interface Interceptor<T, R = T> {
  fulfilled?: (value: T) => R | Promise<R>;
  rejected?: (error: unknown) => unknown;
}

export class InterceptorManager<T> {
  private interceptors: Array<Interceptor<T> | null> = [];

  use(
    fulfilled?: Interceptor<T>["fulfilled"],
    rejected?: Interceptor<T>["rejected"]
  ): number {
    this.interceptors.push({ fulfilled, rejected });
    return this.interceptors.length - 1;
  }

  eject(id: number): void {
    if (this.interceptors[id]) {
      this.interceptors[id] = null;
    }
  }

  clear(): void {
    this.interceptors = [];
  }

  async execute<R = T>(value: T, isError = false): Promise<R> {
    let result: any = value;
    let currentError = isError;

    for (const interceptor of this.interceptors) {
      if (!interceptor) continue;

      try {
        if (currentError && interceptor.rejected) {
          result = await interceptor.rejected(result);
          currentError = false;
        } else if (!currentError && interceptor.fulfilled) {
          result = await interceptor.fulfilled(result);
        }
      } catch (error) {
        result = error;
        currentError = true;
      }
    }

    if (currentError) {
      throw ApiError.from(result);
    }

    return result as R;
  }
}

// Default interceptors
export const defaultRequestInterceptor: Interceptor<Request> = {
  fulfilled: (config) => {
    // Add request ID if not present
    if (!config.id) {
      config.id = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Add request timestamp
    if (!config.metadata) {
      config.metadata = {};
    }
    config.metadata.startTime = Date.now();

    return config;
  },
};

export const defaultResponseInterceptor: Interceptor<Response> = {
  fulfilled: (response) => {
    // Calculate request duration
    const startTime = response.config.metadata?.startTime as number | undefined;
    if (startTime) {
      response.duration = Date.now() - startTime;
    }
    return response;
  },
};
