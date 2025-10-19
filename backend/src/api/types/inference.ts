export type AgentName = "outliner" | "sequential";

export interface InferenceTask {
  id: string;
  roomId: string;
  status: "pending" | "processing" | "completed" | "failed";
  prompt: string;
  agentName: AgentName;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInferenceTaskRequest {
  roomId: string;
  prompt: string;
  agentName?: AgentName;
}

export interface InferenceTaskResponse {
  taskId: string;
  roomId: string;
}
