/**
 * Simple cache implementation with TTL support
 */

import type { CacheConfig } from "./config";
import type { Timer } from "../utils/compat";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class Cache {
  private entries = new Map<string, CacheEntry<unknown>>();
  private timers = new Map<string, Timer>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get<T>(key: string): T | null {
    const entry = this.entries.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, ttl: number): void {
    // Clean up existing timer
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Implement LRU eviction
    if (this.entries.size >= this.maxSize && !this.entries.has(key)) {
      const firstKey = this.entries.keys().next().value;
      if (firstKey) {
        this.delete(firstKey);
      }
    }

    this.entries.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    // Set auto-expiry timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);

    this.timers.set(key, timer);
  }

  delete(key: string): boolean {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
    return this.entries.delete(key);
  }

  clear(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.entries.clear();
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  size(): number {
    return this.entries.size;
  }

  setMaxSize(size: number): void {
    this.maxSize = Math.max(1, size);
    // Evict entries if current size exceeds new max
    while (this.entries.size > this.maxSize) {
      const firstKey = this.entries.keys().next().value;
      if (firstKey) {
        this.delete(firstKey);
      } else {
        break;
      }
    }
  }

  static createKey(
    method: string,
    url: string,
    params?: Record<string, unknown>,
    config?: CacheConfig
  ): string {
    const parts = [method, url];

    if (params && Object.keys(params).length > 0) {
      const sortedParams = Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join("&");
      parts.push(sortedParams);
    }

    return parts.join(":");
  }
}
