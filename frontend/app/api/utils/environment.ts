export const isBrowser =
  typeof window !== "undefined" && typeof window.document !== "undefined";

export const isNode =
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null;

export const isWebWorker =
  typeof self === "object" &&
  self.constructor &&
  self.constructor.name === "DedicatedWorkerGlobalScope";

export const isJsDom =
  (typeof window !== "undefined" && window.name === "nodejs") ||
  (typeof navigator !== "undefined" &&
    (navigator.userAgent.includes("Node.js") ||
      navigator.userAgent.includes("jsdom")));

export const isReactNative =
  typeof navigator !== "undefined" && navigator.product === "ReactNative";

export const isSSR =
  !isBrowser && !isWebWorker && typeof window !== "undefined";

export function getGlobalThis(): typeof globalThis {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self as any;
  if (typeof window !== "undefined") return window as any;
  if (typeof global !== "undefined") return global as any;
  throw new Error("Unable to locate global object");
}

export function canUseDOM(): boolean {
  return isBrowser && !isJsDom;
}

export function getEnvironment():
  | "browser"
  | "node"
  | "webworker"
  | "react-native"
  | "unknown" {
  if (isReactNative) return "react-native";
  if (isBrowser) return "browser";
  if (isNode) return "node";
  if (isWebWorker) return "webworker";
  return "unknown";
}
