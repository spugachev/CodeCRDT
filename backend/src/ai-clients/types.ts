export type Role = "user" | "assistant" | "system" | "tool";

export interface Message {
  role: Role;
  content: string | ContentPart[];
  toolCallId?: string;
  toolCalls?: ToolCall[];
}

export type ContentPart =
  | { type: "text"; text: string }
  | { type: "tool_result"; toolCallId: string; content: unknown };

export interface ToolCall {
  id: string;
  name: string;
  arguments?: unknown;
}

export interface Tool<TInput = unknown> {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
  handler: (
    input: TInput,
    context: Record<string, unknown>
  ) => Promise<string | object>;
}

export type ToolChoice =
  | { mode: "auto" | "any" | "none" }
  | { mode: "specific"; toolName: string };

export interface ChatRequest {
  model?: string;
  messages: Message[];
  tools?: Tool<any>[];
  toolChoice?: ToolChoice;
  maxTokens?: number;
  temperature?: number;
  maxToolIterations?: number;
  context?: Record<string, unknown>;
}

export interface ChatResponse {
  content: string;
  toolCalls?: ToolCall[];
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export type StopReason =
  | "end_turn" // Model finished its response naturally
  | "max_tokens" // Hit the maximum token limit
  | "stop_sequence" // Hit a stop sequence
  | "tool_use" // Stopped to use a tool
  | "content_filtered" // Content was filtered
  | "guardrail_intervened" // Guardrail stopped generation
  | "unknown"; // Unknown or unspecified reason

export type StreamEvent =
  | { type: "start"; data: { model: string } }
  | { type: "delta"; data: { text?: string } }
  | { type: "tool_call"; data: ToolCall }
  | { type: "tool_result"; data: { toolCallId: string; result: unknown } }
  | { type: "error"; data: { message: string } }
  | { type: "end"; data: { messages: Message[]; stopReason?: StopReason } };

/**
 * Unified interface for all AI client implementations.
 * All AI clients (Bedrock, OpenAI, Anthropic, etc.) must implement this interface.
 */
export interface AIClient {
  /**
   * Send a chat request and wait for the complete response.
   * @param request The chat request configuration
   * @returns A promise that resolves to the complete chat response
   */
  chat(request: ChatRequest): Promise<ChatResponse>;

  /**
   * Send a chat request and stream the response.
   * @param request The chat request configuration
   * @returns An async generator that yields stream events
   */
  stream(request: ChatRequest): AsyncGenerator<StreamEvent>;

  /**
   * Clean up any resources used by the client.
   * Should be called when the client is no longer needed.
   */
  destroy(): void;
}
