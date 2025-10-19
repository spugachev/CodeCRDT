// Main API
export { Api, createApi, getApi, resetApi } from "./api";
export type { ApiOptions } from "./api";

// Core
export { HttpClient } from "./core/client";
export { ApiError, ErrorCode } from "./core/errors";
export { Cache } from "./core/cache";
export { InterceptorManager } from "./core/interceptors";

// Types
export type {
  Config,
  Request,
  Response,
  RetryConfig,
  CacheConfig,
} from "./core/config";

// Authentication
export { AuthManager } from "./auth/auth-manager";
export type { AuthToken, AuthState } from "./auth/auth-manager";

// Services
export { BaseService } from "./services/base-service";
export { HealthService } from "./services/health-service";
export { TaskService } from "./services/task-service";
export type { PollOptions } from "./services/task-service";
export { RoomService } from "./services/room-service";
export { EvaluationService } from "./services/evaluation-service";
export type {
  CodeEvaluationRequest,
  CodeEvaluationResponse,
  CodeQualityScore,
} from "./services/evaluation-service";

// API Types
export type {
  InferenceTask,
  CreateInferenceTaskRequest,
  InferenceTaskResponse,
  HealthResponse,
  ErrorResponse,
  RoomMessage,
  RoomSummary,
  PaginatedResult,
  GetRoomsParams,
  GetRoomMessagesParams,
  GetAllMessagesParams,
} from "./types";

// Utilities
export { EventEmitter } from "./utils/event-emitter";
export { Storage, getStorage, createStorage } from "./utils/storage";
export {
  isBrowser,
  isNode,
  isSSR,
  getEnvironment,
  canUseDOM,
} from "./utils/environment";
export {
  fetch,
  AbortController,
  Headers,
  type Timer,
  type Interval,
} from "./utils/compat";
