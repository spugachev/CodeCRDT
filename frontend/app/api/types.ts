export interface InferenceTask {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  prompt: string;
  result?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AgentName = "outliner" | "sequential";

export interface CreateInferenceTaskRequest {
  prompt: string;
  roomId: string;
  agentName?: AgentName;
}

export interface InferenceTaskResponse {
  taskId: string;
  roomId: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
}

export interface RoomMessage {
  id?: number;
  roomId: string;
  prompt: string;
  timestamp: number;
}

export interface RoomSummary {
  roomId: string;
  firstMessage: string;
  firstMessageTimestamp: number;
  messageCount: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetRoomsParams {
  page?: number;
  pageSize?: number;
}

export interface GetRoomMessagesParams {
  page?: number;
  pageSize?: number;
}

export interface GetAllMessagesParams {
  page?: number;
  pageSize?: number;
}
