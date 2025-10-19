/**
 * Cross-platform storage implementation
 */

import { isBrowser } from "./environment";

interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

class MemoryStorage implements StorageAdapter {
  private data = new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }
}

export class Storage implements StorageAdapter {
  private adapter: StorageAdapter;
  private prefix: string;

  constructor(prefix = "api_") {
    this.prefix = prefix;

    // Use localStorage in browser, memory storage elsewhere
    if (isBrowser && typeof window !== "undefined" && window.localStorage) {
      this.adapter = window.localStorage;
    } else {
      this.adapter = new MemoryStorage();
    }
  }

  private key(key: string): string {
    return `${this.prefix}${key}`;
  }

  getItem(key: string): string | null {
    try {
      return this.adapter.getItem(this.key(key));
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      this.adapter.setItem(this.key(key), value);
    } catch {
      // Silently fail on quota exceeded or security errors
    }
  }

  removeItem(key: string): void {
    try {
      this.adapter.removeItem(this.key(key));
    } catch {
      // Silently fail
    }
  }

  clear(): void {
    try {
      if (isBrowser && this.adapter === window.localStorage) {
        // In browser, only clear our prefixed keys
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(this.prefix)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));
      } else {
        // In memory storage, clear everything
        this.adapter.clear();
      }
    } catch {
      // Silently fail
    }
  }
}

// Default storage instance
let defaultStorage: Storage | null = null;

export function getStorage(): Storage {
  if (!defaultStorage) {
    defaultStorage = new Storage();
  }
  return defaultStorage;
}

export function createStorage(prefix?: string): Storage {
  return new Storage(prefix);
}
