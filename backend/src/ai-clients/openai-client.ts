import Ajv from "ajv";
import OpenAI from "openai";
import type {
  AIClient,
  ChatRequest,
  ChatResponse,
  Message,
  StreamEvent,
  StopReason,
  ToolCall,
} from "./types";

const DEFAULT_MODEL_ID = "gpt-5-mini-2025-08-07";

enum OpenAIErrorType {
  TOKEN_LIMIT_EXCEEDED = "TOKEN_LIMIT_EXCEEDED",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  THROTTLING_ERROR = "THROTTLING_ERROR",
  SERVICE_ERROR = "SERVICE_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

interface OpenAIError {
  type: OpenAIErrorType;
  message: string;
  originalError?: Error;
  retryable: boolean;
}

export class OpenAIClient implements AIClient {
  private client: OpenAI;
  private defaultModel: string;
  private readonly maxRetries = 5;
  private readonly baseRetryDelay = 500; // 500ms

  constructor(
    options: {
      apiKey?: string;
      model?: string;
      baseURL?: string; // Support for custom OpenAI-compatible endpoints
      organization?: string;
      defaultHeaders?: Record<string, string>;
    } = {}
  ) {
    this.client = new OpenAI({
      apiKey: options.apiKey || process.env.OPENAI_API_KEY,
      baseURL: options.baseURL || process.env.OPENAI_BASE_URL,
      organization: options.organization || process.env.OPENAI_ORGANIZATION,
      defaultHeaders: options.defaultHeaders,
    });
    this.defaultModel =
      options.model || process.env.OPENAI_MODEL_ID || DEFAULT_MODEL_ID;
  }

  destroy(): void {
    // OpenAI client doesn't need explicit cleanup
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
          // OpenAI expects tool results as separate "tool" messages
          for (const toolResult of toolResultParts) {
            messages.push({
              role: "tool",
              toolCallId: toolResult.toolCallId,
              content: typeof toolResult.content === "string"
                ? toolResult.content
                : JSON.stringify(toolResult.content),
            });
          }
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

  private classifyError(error: unknown): OpenAIError {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : "";
    const lowerMessage = errorMessage.toLowerCase();

    // Check for token limit errors
    if (
      lowerMessage.includes("too many tokens") ||
      lowerMessage.includes("token limit") ||
      lowerMessage.includes("maximum token") ||
      lowerMessage.includes("exceeds the maximum") ||
      lowerMessage.includes("max_completion_tokens") ||
      lowerMessage.includes("context_length_exceeded")
    ) {
      return {
        type: OpenAIErrorType.TOKEN_LIMIT_EXCEEDED,
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
        type: OpenAIErrorType.THROTTLING_ERROR,
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
        type: OpenAIErrorType.VALIDATION_ERROR,
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
      lowerMessage.includes("503")
    ) {
      return {
        type: OpenAIErrorType.SERVICE_ERROR,
        message: errorMessage,
        originalError: error instanceof Error ? error : undefined,
        retryable: true,
      };
    }

    // Unknown error
    return {
      type: OpenAIErrorType.UNKNOWN_ERROR,
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
    const { messages: openAIMessages, systemMessage } = this.prepareMessages(
      request.messages
    );
    let stopReason: StopReason | undefined;

    const openAITools = request.tools?.map((t) => ({
      type: "function" as const,
      function: {
        name: t.name,
        description: t.description || "",
        parameters: t.parameters || {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
      },
    }));

    let temperature = request.temperature ?? 0;
    if (model.indexOf("gpt-5") !== -1) {
      temperature = 1;
    }

    const streamOptions: OpenAI.Chat.ChatCompletionCreateParams = {
      model,
      messages: systemMessage
        ? [
            { role: "system" as const, content: systemMessage },
            ...openAIMessages,
          ]
        : openAIMessages,
      max_completion_tokens: request.maxTokens || 64000,
      temperature,
      tools: openAITools && openAITools.length > 0 ? openAITools : undefined,
      tool_choice: this.mapToolChoice(request.toolChoice),
      stream: true as const,
    };

    let lastError: OpenAIError | null = null;
    let currentOptions = { ...streamOptions };
    let hasYieldedEvents = false;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const stream = await this.client.chat.completions.create({
          ...currentOptions,
          stream: true,
        } as OpenAI.Chat.ChatCompletionCreateParamsStreaming);

        let currentToolCall: {
          id: string;
          name: string;
          arguments: string;
        } | null = null;

        for await (const chunk of stream) {
          hasYieldedEvents = true;
          const choice = chunk.choices?.[0];
          if (!choice) continue;

          const delta = choice.delta;

          // Handle text content
          if (delta?.content) {
            yield { type: "delta", data: { text: delta.content } };
          }

          // Handle tool calls
          if (delta?.tool_calls) {
            for (const toolCall of delta.tool_calls) {
              if (toolCall.id && toolCall.function?.name) {
                // Start of a new tool call
                currentToolCall = {
                  id: toolCall.id,
                  name: toolCall.function.name,
                  arguments: toolCall.function.arguments || "",
                };
              } else if (currentToolCall && toolCall.function?.arguments) {
                // Accumulate arguments
                currentToolCall.arguments += toolCall.function.arguments;
              }
            }
          }

          // Check if we've completed a tool call
          if (choice.finish_reason === "tool_calls" && currentToolCall) {
            let args: unknown = undefined;
            if (currentToolCall.arguments) {
              try {
                args = JSON.parse(currentToolCall.arguments);
              } catch {
                args = currentToolCall.arguments;
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

          // Map finish reason to stop reason
          if (choice.finish_reason) {
            stopReason = this.mapStopReason(choice.finish_reason);
          }
        }

        if (stopReason) {
          yield { type: "__internal_stop", stopReason };
        }

        // Success - exit the retry loop
        return;
      } catch (error) {
        lastError = this.classifyError(error);

        console.error(
          `OpenAI API error (attempt ${attempt + 1}/${this.maxRetries}):`,
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
            lastError.type === OpenAIErrorType.TOKEN_LIMIT_EXCEEDED &&
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
    messages: OpenAI.Chat.ChatCompletionMessageParam[];
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

    const openAIMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    for (const m of filtered) {
      if (m.role === "tool") {
        openAIMessages.push({
          role: "tool" as const,
          tool_call_id: m.toolCallId || "unknown",
          content:
            typeof m.content === "string"
              ? m.content
              : JSON.stringify(m.content),
        });
      } else if (m.role === "assistant") {
        const content =
          typeof m.content === "string"
            ? m.content
            : m.content
                .filter((p) => p.type === "text")
                .map((p) => p.text)
                .join("");

        if (m.toolCalls && m.toolCalls.length > 0) {
          openAIMessages.push({
            role: "assistant" as const,
            content: content || null,
            tool_calls: m.toolCalls.map((tc) => ({
              id: tc.id,
              type: "function" as const,
              function: {
                name: tc.name,
                arguments:
                  typeof tc.arguments === "string"
                    ? tc.arguments
                    : JSON.stringify(tc.arguments || {}),
              },
            })),
          });
        } else {
          openAIMessages.push({
            role: "assistant" as const,
            content: content || "",
          });
        }
      } else if (m.role === "user") {
        // Check if this user message contains tool results
        if (typeof m.content !== "string") {
          const toolResults = m.content.filter((p) => p.type === "tool_result");
          const textParts = m.content.filter((p) => p.type === "text");

          // Add tool results as separate tool messages
          for (const toolResult of toolResults) {
            openAIMessages.push({
              role: "tool" as const,
              tool_call_id: toolResult.toolCallId,
              content:
                typeof toolResult.content === "string"
                  ? toolResult.content
                  : JSON.stringify(toolResult.content),
            });
          }

          // Add text content as user message if present
          if (textParts.length > 0) {
            const textContent = textParts.map((p) => p.text).join("\n");
            if (textContent.trim().length > 0) {
              openAIMessages.push({
                role: "user" as const,
                content: textContent,
              });
            }
          }
        } else {
          // Regular text user message
          openAIMessages.push({
            role: "user" as const,
            content: m.content,
          });
        }
      }
    }

    return {
      messages: openAIMessages,
      systemMessage: systemMessage || undefined,
    };
  }

  private mapToolChoice(
    choice?: ChatRequest["toolChoice"]
  ): OpenAI.Chat.ChatCompletionCreateParams["tool_choice"] {
    if (!choice) return undefined;

    switch (choice.mode) {
      case "auto":
        return "auto";
      case "any":
        return "required";
      case "none":
        return "none";
      case "specific":
        return {
          type: "function",
          function: { name: choice.toolName },
        };
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

  private mapStopReason(openAIReason: string): StopReason {
    switch (openAIReason) {
      case "stop":
        return "end_turn";
      case "length":
        return "max_tokens";
      case "tool_calls":
        return "tool_use";
      case "content_filter":
        return "content_filtered";
      default:
        return "unknown";
    }
  }
}
