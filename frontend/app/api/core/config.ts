/**
 * API configuration types and defaults
 */

export interface Config {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  retry?: RetryConfig;
  cache?: CacheConfig;
}

export interface RetryConfig {
  enabled?: boolean;
  maxAttempts?: number;
  delay?: number;
  maxDelay?: number;
  backoff?: "linear" | "exponential";
}

export interface CacheConfig {
  enabled?: boolean;
  ttl?: number;
  maxSize?: number;
}

export interface Request extends Omit<RequestInit, "body" | "cache"> {
  url?: string;
  params?: Record<string, string | number | boolean | undefined>;
  data?: unknown;
  timeout?: number;
  retry?: RetryConfig | false;
  cache?: CacheConfig | false;
  id?: string;
  metadata?: Record<string, unknown>;
}

export interface Response<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  config: Request;
  cached?: boolean;
  duration?: number;
}

export const DEFAULT_CONFIG: Partial<Config> = {
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  retry: {
    enabled: true,
    maxAttempts: 3,
    delay: 1000,
    maxDelay: 10000,
    backoff: "exponential",
  },
  cache: {
    enabled: false,
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100,
  },
};
