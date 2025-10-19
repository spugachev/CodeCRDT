import Ajv from "ajv";
import {
  BedrockRuntimeClient,
  ConverseStreamCommand,
  type ConverseStreamCommandInput,
  type Message as BedrockMessage,
} from "@aws-sdk/client-bedrock-runtime";
import type {
  AIClient,
  ChatRequest,
  ChatResponse,
  Message,
  StreamEvent,
  StopReason,
  ToolCall,
} from "./types";

const DEFAULT_MODEL_ID = "us.anthropic.claude-sonnet-4-5-20250929-v1:0";

enum BedrockErrorType {
  TOKEN_LIMIT_EXCEEDED = "TOKEN_LIMIT_EXCEEDED",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  THROTTLING_ERROR = "THROTTLING_ERROR",
  SERVICE_ERROR = "SERVICE_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

interface BedrockError {
  type: BedrockErrorType;
  message: string;
  originalError?: Error;
  retryable: boolean;
}

interface BedrockStreamEvent {
  contentBlockDelta?: {
    delta?: {
      text?: string;
      toolUse?: { input?: unknown };
      toolUseInput?: unknown;
    };
    contentBlockIndex?: number;
    index?: number;
  };
  contentBlockStart?: {
    start?: {
      toolUse?: {
        toolUseId: string;
        name: string;
        input?: unknown;
      };
    };
    contentBlockIndex?: number;
    index?: number;
  };
  contentBlockStop?: {
    contentBlockIndex?: number;
    index?: number;
  };
  messageStop?: {
    stopReason?: string;
  };
}

export class BedrockClient implements AIClient {
  private client: BedrockRuntimeClient;
  private defaultModel: string;
  private readonly maxRetries = 5;
  private readonly baseRetryDelay = 1000; // in milliseconds

  constructor(options: { region?: string; model?: string } = {}) {
    this.client = new BedrockRuntimeClient({
      region: options.region || process.env.AWS_REGION || "us-east-1",
    });
    this.defaultModel =
      options.model || process.env.BEDROCK_MODEL_ID || DEFAULT_MODEL_ID;
  }

  destroy(): void {
    this.client.destroy();
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
            // console.debug(`+ [${tool.name.toUpperCase()}]:`, validatedArgs);

            const result = await tool.handler(
              validatedArgs,
              request.context ?? {}
            );

            // console.debug(`- [${tool.name.toUpperCase()}]:`, result);

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

  private classifyError(error: unknown): BedrockError {
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
      (errorName.includes("ValidationException") &&
        lowerMessage.includes("token"))
    ) {
      return {
        type: BedrockErrorType.TOKEN_LIMIT_EXCEEDED,
        message: errorMessage,
        originalError: error instanceof Error ? error : undefined,
        retryable: true,
      };
    }

    // Check for throttling errors
    if (
      lowerMessage.includes("throttl") ||
      lowerMessage.includes("rate limit") ||
      lowerMessage.includes("too many requests") ||
      errorName.includes("ThrottlingException")
    ) {
      return {
        type: BedrockErrorType.THROTTLING_ERROR,
        message: errorMessage,
        originalError: error instanceof Error ? error : undefined,
        retryable: true,
      };
    }

    // Check for validation errors (non-token related)
    if (
      errorName.includes("ValidationException") ||
      lowerMessage.includes("validation")
    ) {
      return {
        type: BedrockErrorType.VALIDATION_ERROR,
        message: errorMessage,
        originalError: error instanceof Error ? error : undefined,
        retryable: false,
      };
    }

    // Check for service errors
    if (
      errorName.includes("ServiceException") ||
      lowerMessage.includes("service unavailable") ||
      lowerMessage.includes("internal server error")
    ) {
      return {
        type: BedrockErrorType.SERVICE_ERROR,
        message: errorMessage,
        originalError: error instanceof Error ? error : undefined,
        retryable: true,
      };
    }

    // Unknown error
    return {
      type: BedrockErrorType.UNKNOWN_ERROR,
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
    const modelId = request.model || this.defaultModel;
    const { messages, system } = this.prepareMessages(request.messages);
    let stopReason: StopReason | undefined;

    const input: ConverseStreamCommandInput = {
      modelId,
      messages,
      system,
      inferenceConfig: {
        maxTokens: request.maxTokens || 64000,
        temperature: request.temperature ?? 0,
      },
      toolConfig:
        request.tools && request.tools.length > 0
          ? ({
              tools: request.tools.map((t) => ({
                toolSpec: {
                  name: t.name,
                  description: t.description || "",
                  inputSchema: t.parameters
                    ? { json: t.parameters }
                    : {
                        json: {
                          type: "object",
                          properties: {},
                          additionalProperties: false,
                        },
                      },
                },
              })),
              toolChoice: this.mapToolChoice(request.toolChoice),
            } as ConverseStreamCommandInput["toolConfig"])
          : undefined,
    };

    let lastError: BedrockError | null = null;
    let currentInput = { ...input };
    let hasYieldedEvents = false;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await this.client.send(
          new ConverseStreamCommand(currentInput)
        );
        const toolBlocks = new Map<
          number,
          { id: string; name: string; inputText: string }
        >();

        for await (const event of response.stream || []) {
          hasYieldedEvents = true;
          const typedEvent = event as BedrockStreamEvent;

          if (typedEvent.messageStop?.stopReason) {
            stopReason = this.mapStopReason(typedEvent.messageStop.stopReason);
          }

          const delta = typedEvent.contentBlockDelta?.delta;
          if (typeof delta?.text !== "undefined") {
            yield { type: "delta", data: { text: delta.text } };
          }

          const start = typedEvent.contentBlockStart?.start;
          if (start?.toolUse) {
            const blockIndex =
              typedEvent.contentBlockStart?.contentBlockIndex ??
              typedEvent.contentBlockStart?.index ??
              0;
            toolBlocks.set(blockIndex, {
              id: start.toolUse.toolUseId,
              name: start.toolUse.name,
              inputText:
                typeof start.toolUse.input === "string"
                  ? start.toolUse.input
                  : start.toolUse.input
                  ? JSON.stringify(start.toolUse.input)
                  : "",
            });
          }

          if (typedEvent.contentBlockDelta) {
            const blockIndex =
              typedEvent.contentBlockDelta.contentBlockIndex ??
              typedEvent.contentBlockDelta.index ??
              0;
            const tb = toolBlocks.get(blockIndex);
            if (tb) {
              const d = typedEvent.contentBlockDelta.delta;
              const chunk = d?.toolUse?.input ?? d?.toolUseInput ?? undefined;
              if (chunk !== undefined) {
                tb.inputText +=
                  typeof chunk === "string" ? chunk : JSON.stringify(chunk);
                toolBlocks.set(blockIndex, tb);
              }
            }
          }

          if (typedEvent.contentBlockStop) {
            const blockIndex =
              typedEvent.contentBlockStop.contentBlockIndex ??
              typedEvent.contentBlockStop.index ??
              0;
            const tb = toolBlocks.get(blockIndex);
            if (tb) {
              let args: unknown = undefined;
              const text = (tb.inputText || "").trim();
              if (text) {
                try {
                  args = JSON.parse(text);
                } catch {
                  args = text;
                }
              }

              yield {
                type: "tool_call",
                data: { id: tb.id, name: tb.name, arguments: args },
              };

              toolBlocks.delete(blockIndex);
            }
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
          `Bedrock API error (attempt ${attempt + 1}/${this.maxRetries}):`,
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
          // Calculate exponential backoff delay with jitter
          const baseDelay = this.baseRetryDelay * Math.pow(2, attempt);
          // Add random jitter (0-50% of base delay) to prevent thundering herd
          const jitter = Math.random() * 0.5 * baseDelay;
          const delay = Math.min(baseDelay + jitter, 60000); // Cap at 60 seconds

          console.info(
            `Retrying in ${Math.round(delay)}ms due to ${lastError.type}...`
          );

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, delay));

          // For token limit errors, reduce the max tokens
          if (
            lastError.type === BedrockErrorType.TOKEN_LIMIT_EXCEEDED &&
            currentInput.inferenceConfig?.maxTokens
          ) {
            const currentMaxTokens = currentInput.inferenceConfig
              .maxTokens as number;
            const reducedTokens = Math.floor(currentMaxTokens * 0.8);

            currentInput = {
              ...currentInput,
              inferenceConfig: {
                ...currentInput.inferenceConfig,
                maxTokens: reducedTokens,
              },
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
    system?: Array<{ text: string }>;
    messages: BedrockMessage[];
  } {
    const systemMsgs = messages.filter((m) => m.role === "system");
    const filtered = messages.filter((m) => m.role !== "system");

    const systemBlocks = systemMsgs.flatMap((m) => {
      if (typeof m.content === "string") {
        return m.content.trim().length > 0 ? [{ text: m.content }] : [];
      }

      return m.content
        .filter((p) => p.type === "text" && p.text.trim().length > 0)
        .map((p) => ({ text: p.type === "text" ? p.text : "" }))
        .filter((b) => b.text.length > 0);
    }) as { text: string }[];

    return {
      system: systemBlocks.length > 0 ? systemBlocks : undefined,
      messages: filtered.map((m) => {
        if (m.role === "tool") {
          return {
            role: "user" as const,
            content: [
              {
                toolResult: {
                  toolUseId: m.toolCallId || "unknown",
                  content: [
                    {
                      text:
                        typeof m.content === "string"
                          ? m.content
                          : JSON.stringify(m.content),
                    },
                  ],
                },
              },
            ],
          } as BedrockMessage;
        }

        const contentParts: Array<
          | { text: string }
          | {
              toolResult: {
                toolUseId: string;
                content: Array<{ text: string }>;
              };
            }
          | {
              toolUse: {
                toolUseId: string;
                name: string;
                input: unknown;
              };
            }
        > =
          typeof m.content === "string"
            ? m.content.trim().length > 0
              ? [{ text: m.content }]
              : []
            : m.content
                .map((part) =>
                  part.type === "text"
                    ? { text: part.text }
                    : {
                        toolResult: {
                          toolUseId: part.toolCallId,
                          content: [{ text: JSON.stringify(part.content) }],
                        },
                      }
                )
                .filter(
                  (p) =>
                    !(
                      "text" in p &&
                      p.text !== undefined &&
                      String(p.text).trim().length === 0
                    )
                );

        if (m.role === "assistant" && m.toolCalls) {
          contentParts.push(
            ...m.toolCalls.map((tc) => ({
              toolUse: {
                toolUseId: tc.id,
                name: tc.name,
                input: tc.arguments ?? {},
              },
            }))
          );
        }

        return {
          role: m.role as "user" | "assistant",
          content: contentParts,
        } as BedrockMessage;
      }),
    };
  }

  private mapToolChoice(choice?: ChatRequest["toolChoice"]) {
    if (!choice) return undefined;
    switch (choice.mode) {
      case "auto":
        return { auto: {} };
      case "any":
        return { any: {} };
      case "none":
        return { none: {} };
      case "specific":
        return { tool: { name: choice.toolName } };
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

  private mapStopReason(bedrockReason: string): StopReason {
    switch (bedrockReason) {
      case "end_turn":
        return "end_turn";
      case "max_tokens":
        return "max_tokens";
      case "stop_sequence":
        return "stop_sequence";
      case "tool_use":
        return "tool_use";
      case "content_filtered":
        return "content_filtered";
      case "guardrail_intervened":
        return "guardrail_intervened";
      default:
        return "unknown";
    }
  }
}
