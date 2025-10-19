import { AgentName } from "./inference";

export interface RoomMessage {
  id?: number;
  roomId: string;
  prompt: string;
  agentName?: AgentName;
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
