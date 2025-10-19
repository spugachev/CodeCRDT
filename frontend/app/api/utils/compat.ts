/**
 * Cross-platform compatibility utilities
 */

import { isNode } from "./environment";

// Timer types that work across environments
export type Timer = ReturnType<typeof setTimeout>;
export type Interval = ReturnType<typeof setInterval>;

// Cross-platform fetch
export const fetch = (() => {
  if (typeof globalThis.fetch !== "undefined") {
    return globalThis.fetch;
  }
  if (isNode && typeof global !== "undefined" && (global as any).fetch) {
    return (global as any).fetch;
  }
  throw new Error(
    "Fetch is not available. Please install a fetch polyfill for Node.js < 18."
  );
})();

// Cross-platform AbortController
export const AbortController = (() => {
  if (typeof globalThis.AbortController !== "undefined") {
    return globalThis.AbortController;
  }

  // Minimal polyfill for environments without AbortController
  class AbortControllerPolyfill {
    signal: any;

    constructor() {
      this.signal = {
        aborted: false,
        reason: undefined,
        onabort: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
        throwIfAborted: () => {
          if (this.signal.aborted) {
            throw this.signal.reason || new Error("Aborted");
          }
        },
      };
    }

    abort(reason?: any): void {
      if (this.signal.aborted) return;
      this.signal.aborted = true;
      this.signal.reason = reason || new Error("Aborted");
      if (this.signal.onabort) {
        this.signal.onabort(new Event("abort"));
      }
    }
  }

  return AbortControllerPolyfill as any;
})();

// Cross-platform Headers
export const Headers = (() => {
  if (typeof globalThis.Headers !== "undefined") {
    return globalThis.Headers;
  }

  // Minimal Headers polyfill
  class HeadersPolyfill {
    private data = new Map<string, string>();

    constructor(init?: HeadersInit) {
      if (init) {
        if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.set(key, value));
        } else if (init && typeof init === "object") {
          Object.entries(init).forEach(([key, value]) => {
            this.set(key, String(value));
          });
        }
      }
    }

    append(name: string, value: string): void {
      const key = name.toLowerCase();
      const existing = this.data.get(key);
      this.data.set(key, existing ? `${existing}, ${value}` : value);
    }

    delete(name: string): void {
      this.data.delete(name.toLowerCase());
    }

    get(name: string): string | null {
      return this.data.get(name.toLowerCase()) || null;
    }

    has(name: string): boolean {
      return this.data.has(name.toLowerCase());
    }

    set(name: string, value: string): void {
      this.data.set(name.toLowerCase(), value);
    }

    forEach(callback: (value: string, key: string) => void): void {
      this.data.forEach(callback);
    }

    entries(): IterableIterator<[string, string]> {
      return this.data.entries();
    }

    keys(): IterableIterator<string> {
      return this.data.keys();
    }

    values(): IterableIterator<string> {
      return this.data.values();
    }

    [Symbol.iterator](): IterableIterator<[string, string]> {
      return this.data.entries();
    }

    getSetCookie(): string[] {
      return [];
    }
  }

  return HeadersPolyfill as any;
})();
