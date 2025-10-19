type FetchTask = {
  input: RequestInfo | URL;
  init?: RequestInit;
  resolve: (r: Response) => void;
  reject: (e: unknown) => void;
  retries?: number;
};

interface ArtifactsFetchConfig {
  concurrency?: number;
  cacheTTL?: number;
  enableCache?: boolean;
  enableLogging?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  errors: number;
  size?: number;
}

export class ArtifactsFetch {
  private static concurrency = 100;
  private static active = 0;
  private static queue: FetchTask[] = [];
  private static readonly CACHE_NAME = "artifacts";
  private static cacheTTL = 7 * 24 * 60 * 60 * 1000; // 7 days default
  private static enableCache = true;
  private static enableLogging = false;
  private static maxRetries = 3;
  private static retryDelay = 1000; // 1 second
  private static stats: CacheStats = {
    hits: 0,
    misses: 0,
    errors: 0,
  };

  /**
   * Configure ArtifactsFetch with advanced options
   */
  static configure(opts: ArtifactsFetchConfig = {}): void {
    ArtifactsFetch.concurrency = Math.max(1, opts.concurrency ?? 100);
    ArtifactsFetch.cacheTTL = opts.cacheTTL ?? ArtifactsFetch.cacheTTL;
    ArtifactsFetch.enableCache = opts.enableCache ?? true;
    ArtifactsFetch.enableLogging = opts.enableLogging ?? false;
    ArtifactsFetch.maxRetries = opts.maxRetries ?? 3;
    ArtifactsFetch.retryDelay = opts.retryDelay ?? 1000;
  }

  /**
   * Get cache statistics
   */
  static getStats(): CacheStats {
    return { ...ArtifactsFetch.stats };
  }

  /**
   * Reset cache statistics
   */
  static resetStats(): void {
    ArtifactsFetch.stats = { hits: 0, misses: 0, errors: 0 };
  }

  /**
   * Generate a deterministic cache key for a request
   */
  private static getCacheKey(
    input: RequestInfo | URL,
    init?: RequestInit
  ): string {
    const url = input instanceof Request ? input.url : input.toString();
    const method = (init?.method || "GET").toUpperCase();

    // Create a more robust cache key
    const keyParts = [method, url];

    // Add body to cache key if present
    if (init?.body) {
      if (typeof init.body === "string") {
        keyParts.push(init.body);
      } else if (init.body instanceof FormData) {
        // For FormData, create a simple representation
        keyParts.push("FormData");
      } else {
        keyParts.push(JSON.stringify(init.body));
      }
    }

    // Add important headers to cache key
    if (init?.headers) {
      const headers = new Headers(init.headers);
      const contentType = headers.get("content-type");
      if (contentType) {
        keyParts.push(`ct:${contentType}`);
      }
    }

    return keyParts.join("|");
  }

  /**
   * Check if caching should be used for this request
   */
  private static shouldCache(init?: RequestInit): boolean {
    if (!ArtifactsFetch.enableCache) return false;

    const method = (init?.method || "GET").toUpperCase();
    // Only cache GET and HEAD requests by default
    return method === "GET" || method === "HEAD";
  }

  /**
   * Load response from cache if available and valid
   */
  private static async loadFromCache(key: string): Promise<Response | null> {
    if (!ArtifactsFetch.enableCache) return null;

    try {
      const cache = await caches.open(ArtifactsFetch.CACHE_NAME);
      const request = new Request(key);
      const cached = await cache.match(request);

      if (!cached) {
        ArtifactsFetch.stats.misses++;
        return null;
      }

      // Check if cache is expired
      const timestamp = cached.headers.get("x-cache-timestamp");
      const cacheAge = timestamp
        ? Date.now() - parseInt(timestamp, 10)
        : Infinity;

      if (cacheAge > ArtifactsFetch.cacheTTL) {
        await cache.delete(request);
        ArtifactsFetch.stats.misses++;
        ArtifactsFetch.log(`Cache expired for: ${key}`);
        return null;
      }

      ArtifactsFetch.stats.hits++;
      ArtifactsFetch.log(
        `Cache hit for: ${key} (age: ${Math.round(cacheAge / 1000)}s)`
      );

      // Add cache hit header
      const headers = new Headers(cached.headers);
      headers.set("x-cache-hit", "true");
      headers.set("x-cache-age", cacheAge.toString());

      return new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers,
      });
    } catch (error) {
      ArtifactsFetch.stats.errors++;
      ArtifactsFetch.log("Cache load error:", error);
      return null;
    }
  }

  /**
   * Save response to cache
   */
  private static async saveToCache(
    key: string,
    response: Response
  ): Promise<void> {
    if (!ArtifactsFetch.enableCache) return;

    try {
      const cache = await caches.open(ArtifactsFetch.CACHE_NAME);

      // Clone response to avoid consuming the body
      const cloned = response.clone();
      const headers = new Headers(cloned.headers);

      // Add cache metadata
      headers.set("x-cache-timestamp", Date.now().toString());
      headers.set("x-cache-key", key);

      // Create cacheable response
      const body = await cloned.blob();
      const cachedResponse = new Response(body, {
        status: cloned.status,
        statusText: cloned.statusText,
        headers,
      });

      const request = new Request(key);
      await cache.put(request, cachedResponse);

      ArtifactsFetch.log(`Cached response for: ${key}`);
    } catch (error) {
      ArtifactsFetch.stats.errors++;
      ArtifactsFetch.log("Cache save error:", error);
    }
  }

  /**
   * Clear expired cache entries
   */
  static async clearExpiredCache(): Promise<number> {
    let cleared = 0;
    try {
      const cache = await caches.open(ArtifactsFetch.CACHE_NAME);
      const requests = await cache.keys();

      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const timestamp = response.headers.get("x-cache-timestamp");
          const age = timestamp
            ? Date.now() - parseInt(timestamp, 10)
            : Infinity;

          if (age > ArtifactsFetch.cacheTTL) {
            await cache.delete(request);
            cleared++;
          }
        }
      }

      ArtifactsFetch.log(`Cleared ${cleared} expired cache entries`);
    } catch (error) {
      ArtifactsFetch.log("Failed to clear expired cache:", error);
    }
    return cleared;
  }

  /**
   * Clear all cache
   */
  static async clearCache(): Promise<void> {
    try {
      await caches.delete(ArtifactsFetch.CACHE_NAME);
      ArtifactsFetch.resetStats();
      ArtifactsFetch.log("Cache cleared");
    } catch (error) {
      ArtifactsFetch.log("Failed to clear cache:", error);
    }
  }

  /**
   * Get cache size estimate
   */
  static async getCacheSize(): Promise<number> {
    try {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return estimate.usage || 0;
      }
    } catch (error) {
      ArtifactsFetch.log("Failed to get cache size:", error);
    }
    return 0;
  }

  /**
   * Main fetch method with queue management and caching
   */
  static async fetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const cacheKey = ArtifactsFetch.getCacheKey(input, init);

    // Try cache first for cacheable requests
    if (ArtifactsFetch.shouldCache(init)) {
      const cached = await ArtifactsFetch.loadFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Queue the request
    return new Promise<Response>((resolve, reject) => {
      ArtifactsFetch.queue.push({
        input,
        init,
        resolve,
        reject,
        retries: 0,
      });
      ArtifactsFetch.pump();
    });
  }

  /**
   * Wait until all queued work has finished
   */
  static async drain(): Promise<void> {
    if (ArtifactsFetch.active === 0 && ArtifactsFetch.queue.length === 0)
      return;

    await new Promise<void>((resolve) => {
      const check = () => {
        if (ArtifactsFetch.active === 0 && ArtifactsFetch.queue.length === 0) {
          resolve();
        } else {
          setTimeout(check, 10);
        }
      };
      check();
    });
  }

  /**
   * Get current queue status
   */
  static getQueueStatus(): { active: number; queued: number } {
    return {
      active: ArtifactsFetch.active,
      queued: ArtifactsFetch.queue.length,
    };
  }

  /**
   * Process queue
   */
  private static pump(): void {
    while (
      ArtifactsFetch.active < ArtifactsFetch.concurrency &&
      ArtifactsFetch.queue.length > 0
    ) {
      const task = ArtifactsFetch.queue.shift()!;
      ArtifactsFetch.run(task);
    }
  }

  /**
   * Execute a fetch task with retry logic
   */
  private static async run(task: FetchTask): Promise<void> {
    ArtifactsFetch.active += 1;

    try {
      const response = await fetch(
        task.input as RequestInfo,
        task.init as RequestInit
      );

      // Cache successful responses
      if (response.ok && ArtifactsFetch.shouldCache(task.init)) {
        const cacheKey = ArtifactsFetch.getCacheKey(task.input, task.init);
        await ArtifactsFetch.saveToCache(cacheKey, response);
      }

      task.resolve(response);
    } catch (error) {
      // Retry logic for network errors
      const retries = task.retries || 0;

      if (retries < ArtifactsFetch.maxRetries) {
        ArtifactsFetch.log(
          `Retrying request (${retries + 1}/${ArtifactsFetch.maxRetries}):`,
          error
        );

        // Exponential backoff
        const delay = ArtifactsFetch.retryDelay * Math.pow(2, retries);

        setTimeout(() => {
          task.retries = retries + 1;
          ArtifactsFetch.queue.unshift(task); // Add back to front of queue
          ArtifactsFetch.pump();
        }, delay);

        ArtifactsFetch.active -= 1;
        return;
      }

      ArtifactsFetch.log("Request failed after retries:", error);
      task.reject(error);
    } finally {
      ArtifactsFetch.active -= 1;
      ArtifactsFetch.pump();
    }
  }

  /**
   * Internal logging helper
   */
  private static log(...args: unknown[]): void {
    if (ArtifactsFetch.enableLogging) {
      console.log("[ArtifactsFetch]", ...args);
    }
  }
}
