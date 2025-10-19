import Ajv from "ajv";
import Anthropic from "@anthropic-ai/sdk";
import type {
  AIClient,
  ChatRequest,
  ChatResponse,
  Message,
  StreamEvent,
  StopReason,
  ToolCall,
} from "./types";

const DEFAULT_MODEL_ID = "claude-sonnet-4-5-20250929";

enum AnthropicErrorType {
  TOKEN_LIMIT_EXCEEDED = "TOKEN_LIMIT_EXCEEDED",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  THROTTLING_ERROR = "THROTTLING_ERROR",
  SERVICE_ERROR = "SERVICE_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

interface AnthropicError {
  type: AnthropicErrorType;
  message: string;
  originalError?: Error;
  retryable: boolean;
}

export class AnthropicClient implements AIClient {
  private client: Anthropic;
  private defaultModel: string;
  private readonly maxRetries = 5;
  private readonly baseRetryDelay = 500; // 500ms

  constructor(
    options: {
      apiKey?: string;
      model?: string;
      baseURL?: string; // Support for custom Claude-compatible endpoints
      defaultHeaders?: Record<string, string>;
    } = {}
  ) {
    this.client = new Anthropic({
      apiKey: options.apiKey || process.env.ANTHROPIC_API_KEY,
      baseURL: options.baseURL || process.env.ANTHROPIC_BASE_URL,
      defaultHeaders: options.defaultHeaders,
    });

    this.defaultModel =
      options.model || process.env.ANTHROPIC_MODEL_ID || DEFAULT_MODEL_ID;
  }

  destroy(): void {
    // Anthropic client doesn't need explicit cleanup
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const events: StreamEvent[] = [];
    for await (const event of this.stream(request)) {
      events.push(event);
    }
    return this.eventsToResponse(events);
  }

  async *stream(request: ChatRequest): AsyncGenerator<StreamEvent> {
    const model = request.model || this.defaultModel;

    yield { type: "start", data: { model } };

    const tools = request.tools || [];
    const toolMap = new Map(tools.map((t) => [t.name, t]));
    const ajv = new Ajv({
      allErrors: true,
      strict: false,
      useDefaults: true,
      coerceTypes: true,
    });

    const validatorMap = new Map<
      string,
      | ((data: unknown) => {
          valid: boolean;
          data: unknown;
          errors?: string[];
        })
      | undefined
    >();

    for (const tool of tools) {
      if (typeof tool.parameters === "undefined") {
        validatorMap.set(tool.name, undefined);
        continue;
      }

      try {
        // Best-effort compile; schema may be loosely typed
        const validate = ajv.compile(tool.parameters);
        validatorMap.set(tool.name, (data: unknown) => {
          // Clone to avoid mutating original args when applying defaults
          const clone =
            data === undefined ? {} : JSON.parse(JSON.stringify(data));
          const valid = validate(clone) as boolean;

          return {
            valid,
            data: clone,
            errors: valid
              ? undefined
              : (validate.errors || []).map((e) =>
                  `${e.instancePath || "/"} ${e.message}`.trim()
                ),
          };
        });
      } catch {
        // If schema can't compile, skip validation for this tool
        validatorMap.set(tool.name, undefined);
      }
    }

    let messages = [...request.messages];
    let stopReason: StopReason | undefined;

    try {
      const maxIterations = request.maxToolIterations ?? 100;
      let iteration = 0;

      while (true) {
        const pendingToolCalls: ToolCall[] = [];
        let turnText = "";

        if (iteration > 0) {
          // clear tool choice after first iteration to avoid loops
          request = { ...request, toolChoice: undefined };
        }

        for await (const event of this.streamOnce({ ...request, messages })) {
          if (event.type === "__internal_stop") {
            stopReason = event.stopReason;
            continue;
          }

          if (event.type === "delta" && event.data.text) {
            turnText += event.data.text;
          }

          yield event;

          if (event.type === "tool_call") {
            pendingToolCalls.push(event.data);
          }
        }

        if (pendingToolCalls.length === 0) {
          if (turnText.trim().length > 0) {
            messages.push({ role: "assistant", content: turnText });
          }

          break;
        }

        messages.push({
          role: "assistant",
          content: turnText || "",
          toolCalls: pendingToolCalls,
        });

        const toolResultParts: {
          type: "tool_result";
          toolCallId: string;
          content: unknown;
        }[] = [];

        const executions = pendingToolCalls.map(async (tc) => {
          const tool = toolMap.get(tc.name);
          if (!tool) {
            return {
              toolCallId: tc.id,
              result: { error: `Tool '${tc.name}' not found` },
            } as const;
          }

          const validator = validatorMap.get(tool.name);
          let validatedArgs: unknown = tc.arguments;
          if (typeof validator !== "undefined") {
            if (validator) {
              const validation = validator(tc.arguments);
              if (!validation.valid) {
                return {
                  toolCallId: tc.id,
                  result: {
                    error: "Invalid tool arguments",
                    details: validation.errors,
                  },
                } as const;
              }

              validatedArgs = validation.data;
            }
          }

          try {
            const result = await tool.handler(
              validatedArgs,
              request.context ?? {}
            );

            return { toolCallId: tc.id, result } as const;
          } catch (err) {
            console.error("Error occurred while executing tool:", err);

            return {
              toolCallId: tc.id,
              result: {
                error: err instanceof Error ? err.message : String(err),
              },
            } as const;
          }
        });

        const results = await Promise.all(executions);

        for (const r of results) {
          yield {
            type: "tool_result",
            data: { toolCallId: r.toolCallId, result: r.result },
          };

          toolResultParts.push({
            type: "tool_result",
            toolCallId: r.toolCallId,
            content: r.result,
          });
        }

        if (toolResultParts.length > 0) {
          messages.push({ role: "user", content: toolResultParts });
        }

        iteration += 1;
        if (iteration >= maxIterations) {
          yield {
            type: "error",
            data: {
              message: `Aborting after ${maxIterations} tool iterations to prevent loops.`,
            },
          };
          break;
        }
      }
    } catch (error) {
      console.error("Error occurred during chat streaming:", error);

      yield {
        type: "error",
        data: {
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }

    yield { type: "end", data: { messages, stopReason } };
  }

  private classifyError(error: unknown): AnthropicError {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : "";
    const lowerMessage = errorMessage.toLowerCase();

    // Check for token limit errors
    if (
      lowerMessage.includes("too many tokens") ||
      lowerMessage.includes("token limit") ||
      lowerMessage.includes("maximum token") ||
      lowerMessage.includes("exceeds the maximum") ||
      lowerMessage.includes("max_tokens") ||
      lowerMessage.includes("context_length_exceeded")
    ) {
      return {
        type: AnthropicErrorType.TOKEN_LIMIT_EXCEEDED,
        message: errorMessage,
        originalError: error instanceof Error ? error : undefined,
        retryable: true,
      };
    }

    // Check for throttling errors
    if (
      lowerMessage.includes("rate limit") ||
      lowerMessage.includes("too many requests") ||
      errorName.includes("RateLimitError")
    ) {
      return {
        type: AnthropicErrorType.THROTTLING_ERROR,
        message: errorMessage,
        originalError: error instanceof Error ? error : undefined,
        retryable: true,
      };
    }

    // Check for validation errors
    if (
      lowerMessage.includes("invalid") ||
      lowerMessage.includes("validation")
    ) {
      return {
        type: AnthropicErrorType.VALIDATION_ERROR,
        message: errorMessage,
        originalError: error instanceof Error ? error : undefined,
        retryable: false,
      };
    }

    // Check for service errors
    if (
      lowerMessage.includes("service unavailable") ||
      lowerMessage.includes("internal server error") ||
      lowerMessage.includes("500") ||
      lowerMessage.includes("503") ||
      lowerMessage.includes("overloaded")
    ) {
      return {
        type: AnthropicErrorType.SERVICE_ERROR,
        message: errorMessage,
        originalError: error instanceof Error ? error : undefined,
        retryable: true,
      };
    }

    // Unknown error
    return {
      type: AnthropicErrorType.UNKNOWN_ERROR,
      message: errorMessage,
      originalError: error instanceof Error ? error : undefined,
      retryable: false,
    };
  }

  private async *streamOnce(request: ChatRequest): AsyncGenerator<
    | StreamEvent
    | {
        type: "__internal_stop";
        stopReason: StopReason;
      }
  > {
    const model = request.model || this.defaultModel;
    const { messages: anthropicMessages, systemMessage } = this.prepareMessages(
      request.messages
    );
    let stopReason: StopReason | undefined;

    const anthropicTools: Anthropic.Tool[] | undefined = request.tools?.map(
      (t) => ({
        name: t.name,
        description: t.description || "",
        input_schema: (t.parameters as Anthropic.Tool.InputSchema) || {
          type: "object" as const,
          properties: {},
          additionalProperties: false,
        },
      })
    );

    const streamOptions: Anthropic.MessageCreateParams = {
      model,
      messages: anthropicMessages,
      max_tokens: request.maxTokens || 8192,
      temperature: request.temperature ?? 0,
      system: systemMessage,
      tools:
        anthropicTools && anthropicTools.length > 0
          ? anthropicTools
          : undefined,
      tool_choice: this.mapToolChoice(request.toolChoice),
      stream: true,
    };

    let lastError: AnthropicError | null = null;
    let currentOptions = { ...streamOptions };
    let hasYieldedEvents = false;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const stream = await this.client.messages.stream(
          currentOptions as Anthropic.MessageStreamParams
        );

        let currentToolCall: {
          id: string;
          name: string;
          inputJson: string;
        } | null = null;

        for await (const event of stream) {
          hasYieldedEvents = true;
          // Handle different event types from Anthropic
          switch (event.type) {
            case "message_start":
              // Message started
              break;

            case "content_block_start":
              if (event.content_block.type === "tool_use") {
                currentToolCall = {
                  id: event.content_block.id,
                  name: event.content_block.name,
                  inputJson: "",
                };
              }
              break;

            case "content_block_delta":
              if (event.delta.type === "text_delta") {
                yield { type: "delta", data: { text: event.delta.text } };
              } else if (
                event.delta.type === "input_json_delta" &&
                currentToolCall
              ) {
                currentToolCall.inputJson += event.delta.partial_json;
              }
              break;

            case "content_block_stop":
              if (currentToolCall && event.index !== undefined) {
                let args: unknown = undefined;
                if (currentToolCall.inputJson) {
                  try {
                    args = JSON.parse(currentToolCall.inputJson);
                  } catch {
                    args = currentToolCall.inputJson;
                  }
                }

                yield {
                  type: "tool_call",
                  data: {
                    id: currentToolCall.id,
                    name: currentToolCall.name,
                    arguments: args,
                  },
                };

                currentToolCall = null;
              }
              break;

            case "message_stop":
              // Map stop reason from the final message
              // The stop reason will be available in the message_stop event
              // We'll handle it after the stream ends
              break;

            case "message_delta":
              // Handle usage updates if needed
              break;
          }
        }

        // Get the final message to extract stop reason
        const finalMessage = await stream.finalMessage();
        if (finalMessage?.stop_reason) {
          stopReason = this.mapStopReason(finalMessage.stop_reason);
        }

        if (stopReason) {
          yield { type: "__internal_stop", stopReason };
        }

        // Success - exit the retry loop
        return;
      } catch (error) {
        lastError = this.classifyError(error);

        console.error(
          `Anthropic API error (attempt ${attempt + 1}/${this.maxRetries}):`,
          {
            type: lastError.type,
            message: lastError.message,
            retryable: lastError.retryable,
          }
        );

        // If we've already started streaming, don't retry to prevent duplicate content
        if (hasYieldedEvents) {
          console.error(
            "Cannot retry after streaming has started to prevent duplicate content"
          );
          break;
        }

        // Check if error is retryable and we have attempts left
        if (lastError.retryable && attempt < this.maxRetries - 1) {
          // Calculate exponential backoff delay
          const delay = this.baseRetryDelay * Math.pow(2, attempt);

          console.info(`Retrying in ${delay}ms due to ${lastError.type}...`);

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, delay));

          // For token limit errors, reduce the max tokens
          if (
            lastError.type === AnthropicErrorType.TOKEN_LIMIT_EXCEEDED &&
            currentOptions.max_tokens
          ) {
            const currentMaxTokens = currentOptions.max_tokens;
            const reducedTokens = Math.floor(currentMaxTokens * 0.8);

            currentOptions = {
              ...currentOptions,
              max_tokens: reducedTokens,
            };

            console.info(
              `Reduced maxTokens from ${currentMaxTokens} to ${reducedTokens} for retry`
            );
          }

          continue; // Retry the request
        }

        // If not retryable or max retries exhausted, break
        break;
      }
    }

    // If we've exhausted all retries or hit a non-retryable error
    if (lastError) {
      const errorMessage = lastError.retryable
        ? `Failed after ${this.maxRetries} attempts: ${lastError.message}`
        : lastError.message;

      yield {
        type: "error",
        data: {
          message: errorMessage,
        },
      };
    }
  }

  private prepareMessages(messages: Message[]): {
    messages: Anthropic.MessageParam[];
    systemMessage?: string;
  } {
    const systemMsgs = messages.filter((m) => m.role === "system");
    const filtered = messages.filter((m) => m.role !== "system");

    const systemMessage = systemMsgs
      .map((m) => {
        if (typeof m.content === "string") {
          return m.content.trim();
        }
        return m.content
          .filter((p) => p.type === "text")
          .map((p) => (p.type === "text" ? p.text : ""))
          .join("\n");
      })
      .filter((text) => text.length > 0)
      .join("\n");

    const anthropicMessages: Anthropic.MessageParam[] = [];

    for (let i = 0; i < filtered.length; i++) {
      const m = filtered[i];

      if (m.role === "assistant") {
        const contentParts: (
          | Anthropic.TextBlockParam
          | Anthropic.ToolUseBlockParam
        )[] = [];

        // Add text content if present
        const textContent =
          typeof m.content === "string"
            ? m.content
            : m.content
                .filter((p) => p.type === "text")
                .map((p) => p.text)
                .join("");

        if (textContent) {
          contentParts.push({
            type: "text" as const,
            text: textContent,
          });
        }

        // Add tool use blocks if present
        if (m.toolCalls && m.toolCalls.length > 0) {
          for (const tc of m.toolCalls) {
            contentParts.push({
              type: "tool_use" as const,
              id: tc.id,
              name: tc.name,
              input: tc.arguments || {},
            });
          }
        }

        if (contentParts.length > 0) {
          anthropicMessages.push({
            role: "assistant",
            content: contentParts,
          });
        }

        // If there were tool calls, ensure the next message has tool results
        if (m.toolCalls && m.toolCalls.length > 0) {
          // Look for tool results in the next user message
          const nextMsg = filtered[i + 1];
          if (nextMsg && nextMsg.role === "user") {
            const toolResults: Anthropic.ToolResultBlockParam[] = [];

            // Process tool results from user message content
            if (typeof nextMsg.content !== "string") {
              for (const part of nextMsg.content) {
                if (part.type === "tool_result") {
                  toolResults.push({
                    type: "tool_result",
                    tool_use_id: part.toolCallId,
                    content:
                      typeof part.content === "string"
                        ? part.content
                        : JSON.stringify(part.content),
                  });
                }
              }
            }

            // If we found tool results, add them
            if (toolResults.length > 0) {
              anthropicMessages.push({
                role: "user",
                content: toolResults,
              });
              i++; // Skip the next message since we processed it
              continue;
            }
          }

          // If no tool results found but tool calls exist, create placeholder results
          // This prevents the validation error
          const placeholderResults: Anthropic.ToolResultBlockParam[] = [];
          for (const tc of m.toolCalls) {
            placeholderResults.push({
              type: "tool_result",
              tool_use_id: tc.id,
              content: "Tool execution pending",
            });
          }
          anthropicMessages.push({
            role: "user",
            content: placeholderResults,
          });
        }
      } else if (m.role === "user") {
        // Handle regular user messages
        if (typeof m.content === "string") {
          anthropicMessages.push({
            role: "user",
            content: m.content,
          });
        } else {
          // Check if this contains tool results
          const toolResults: Anthropic.ToolResultBlockParam[] = [];
          const textParts: string[] = [];

          for (const part of m.content) {
            if (part.type === "text") {
              textParts.push(part.text);
            } else if (part.type === "tool_result") {
              toolResults.push({
                type: "tool_result",
                tool_use_id: part.toolCallId,
                content:
                  typeof part.content === "string"
                    ? part.content
                    : JSON.stringify(part.content),
              });
            }
          }

          if (toolResults.length > 0) {
            // If there are tool results, use them as content
            anthropicMessages.push({
              role: "user",
              content: toolResults,
            });
          } else if (textParts.length > 0) {
            // Otherwise use text content
            anthropicMessages.push({
              role: "user",
              content: textParts.join("\n"),
            });
          }
        }
      }
    }

    // Ensure messages alternate between user and assistant
    // Anthropic requires the first message to be from the user
    if (
      anthropicMessages.length === 0 ||
      anthropicMessages[0].role !== "user"
    ) {
      anthropicMessages.unshift({
        role: "user",
        content: "Start",
      });
    }

    return {
      messages: anthropicMessages,
      systemMessage: systemMessage || undefined,
    };
  }

  private mapToolChoice(
    choice?: ChatRequest["toolChoice"]
  ): Anthropic.MessageCreateParams["tool_choice"] {
    if (!choice) return undefined;

    switch (choice.mode) {
      case "auto":
        return { type: "auto" };
      case "any":
        return { type: "any" };
      case "none":
        return undefined; // Anthropic doesn't have explicit "none" mode
      case "specific":
        return { type: "tool", name: choice.toolName };
      default:
        return undefined;
    }
  }

  private eventsToResponse(events: StreamEvent[]): ChatResponse {
    let content = "";
    const toolCalls: ToolCall[] = [];

    for (const event of events) {
      if (event.type === "delta" && event.data.text) {
        content += event.data.text;
      } else if (event.type === "tool_call") {
        toolCalls.push(event.data);
      }
    }

    return {
      content,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    };
  }

  private mapStopReason(anthropicReason: string): StopReason {
    switch (anthropicReason) {
      case "end_turn":
        return "end_turn";
      case "max_tokens":
        return "max_tokens";
      case "stop_sequence":
        return "stop_sequence";
      case "tool_use":
        return "tool_use";
      default:
        return "unknown";
    }
  }
}
