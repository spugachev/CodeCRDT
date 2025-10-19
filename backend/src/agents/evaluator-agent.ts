import { Message, Tool } from "../ai-clients";
import { AgentBase } from "../core";

export interface CodeEvaluationRequest {
  code: string;
  language?: "typescript" | "tsx" | "javascript" | "jsx";
}

export interface CodeQualityScore {
  score: number; // 0-25
  details: string[];
}

export interface CodeEvaluationResponse {
  codeQuality: CodeQualityScore;
  architectureAndState: CodeQualityScore;
  runtimePerformance: CodeQualityScore;
  accessibilityAndUX: CodeQualityScore;
  overallScore: number; // 0-100
  summary: string;
}

const EVALUATION_SYSTEM_PROMPT = `
You are a code quality evaluator specializing in React TypeScript applications.
Evaluate the provided code based on four key criteria and provide scores.

# Evaluation Criteria

## 1. Code Quality (0-25 points)
- ESLint, TypeScript ESLint, Prettier compliance
- Clear naming conventions
- Small, focused functions
- Low cyclomatic complexity
- Strict TypeScript usage (minimal any/unknown)
- Well-defined interfaces and generics
- DRY principles
- Clear module boundaries
- Comments where intent is not obvious

## 2. Architecture and State Management (0-25 points)
- Separation of container and presentational components
- Appropriate state colocation
- Proper use of server state management (React Query/SWR)
- Minimal global state usage
- Error boundaries implementation
- Suspense usage where appropriate
- Feature-based folder structure

## 3. Runtime Performance (0-25 points)
- Proper use of memo, useMemo, useCallback
- List virtualization for long lists
- Debounce/throttle for expensive operations
- Efficient data fetching patterns
- HTTP caching strategies
- Request deduplication
- Optimized bundle size

## 4. Accessibility and UX Quality (0-25 points)
- Semantic HTML usage
- ARIA attributes when needed
- Full keyboard navigation support
- Visible focus states
- WCAG AA contrast compliance
- Respect for prefers-reduced-motion
- Proper form labels and error handling
- Screen reader support
- i18n readiness

Use the evaluate_code tool to provide your evaluation.
`;

const EVALUATION_TOOL: Tool = {
  name: "evaluate_code",
  description: "Provide a structured code quality evaluation",
  parameters: {
    type: "object",
    properties: {
      codeQuality: {
        type: "object",
        properties: {
          score: {
            type: "number",
            minimum: 0,
            maximum: 25,
            description: "Score for code quality (0-25)",
          },
          details: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Specific observations about code quality",
          },
        },
        required: ["score", "details"],
      },
      architectureAndState: {
        type: "object",
        properties: {
          score: {
            type: "number",
            minimum: 0,
            maximum: 25,
            description: "Score for architecture and state management (0-25)",
          },
          details: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Specific observations about architecture",
          },
        },
        required: ["score", "details"],
      },
      runtimePerformance: {
        type: "object",
        properties: {
          score: {
            type: "number",
            minimum: 0,
            maximum: 25,
            description: "Score for runtime performance (0-25)",
          },
          details: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Specific observations about performance",
          },
        },
        required: ["score", "details"],
      },
      accessibilityAndUX: {
        type: "object",
        properties: {
          score: {
            type: "number",
            minimum: 0,
            maximum: 25,
            description: "Score for accessibility and UX (0-25)",
          },
          details: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Specific observations about accessibility and UX",
          },
        },
        required: ["score", "details"],
      },
      overallScore: {
        type: "number",
        minimum: 0,
        maximum: 100,
        description: "Overall score (sum of all category scores)",
      },
      summary: {
        type: "string",
        description: "Brief overall assessment of the code",
      },
    },
    required: [
      "codeQuality",
      "architectureAndState",
      "runtimePerformance",
      "accessibilityAndUX",
      "overallScore",
      "summary",
    ],
  },
  handler: async (args: unknown) => {
    // This handler is not actually called, we just use it for structured output
    return args as string | object;
  },
};

export class EvaluatorAgent extends AgentBase {
  constructor() {
    super({});
  }

  async evaluateCode(
    request: CodeEvaluationRequest
  ): Promise<CodeEvaluationResponse> {
    const messages: Message[] = [
      {
        role: "system",
        content: EVALUATION_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: `Evaluate this ${
          request.language || "TypeScript"
        } code:\n\n\`\`\`${request.language || "typescript"}\n${
          request.code
        }\n\`\`\`\n\nUse the evaluate_code tool to provide your structured evaluation.`,
      },
    ];

    try {
      const response = await this.aiClient.chat({
        messages,
        maxTokens: 2000,
        temperature: 0.0,
        tools: [EVALUATION_TOOL],
        toolChoice: {
          mode: "specific",
          toolName: "evaluate_code",
        },
      });

      // Extract the tool call result
      if (response.toolCalls && response.toolCalls.length > 0) {
        const toolCall = response.toolCalls[0];
        if (toolCall.name === "evaluate_code" && toolCall.arguments) {
          const evaluation = toolCall.arguments as CodeEvaluationResponse;

          // Validate the response structure
          if (!this.isValidEvaluation(evaluation)) {
            throw new Error("Invalid evaluation response structure");
          }

          // Validate overall score equals sum of components
          const calculatedOverall =
            evaluation.codeQuality.score +
            evaluation.architectureAndState.score +
            evaluation.runtimePerformance.score +
            evaluation.accessibilityAndUX.score;

          if (Math.abs(calculatedOverall - evaluation.overallScore) > 0.1) {
            throw new Error(
              `Overall score mismatch: ${evaluation.overallScore} != ${calculatedOverall}`
            );
          }

          return evaluation;
        }
      }

      // Fallback: try to parse content as JSON if no tool calls
      if (response.content) {
        const content = response.content.trim();
        let jsonStr = content;

        // Extract JSON from markdown if present
        if (content.includes("```json")) {
          const match = content.match(/```json\n?([\s\S]*?)\n?```/);
          if (match) {
            jsonStr = match[1];
          }
        } else if (content.includes("```")) {
          const match = content.match(/```\n?([\s\S]*?)\n?```/);
          if (match) {
            jsonStr = match[1];
          }
        }

        const evaluation = JSON.parse(jsonStr) as CodeEvaluationResponse;

        // Validate the response structure
        if (!this.isValidEvaluation(evaluation)) {
          throw new Error("Invalid evaluation response structure");
        }

        return evaluation;
      }

      throw new Error("No evaluation response received");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error evaluating code:", {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        codeLength: request.code.length,
        language: request.language,
      });

      // Throw error instead of returning zeros to prevent biasing results
      throw new Error(`Code evaluation failed: ${errorMessage}`);
    }
  }

  private isValidEvaluation(
    evaluation: unknown
  ): evaluation is CodeEvaluationResponse {
    if (!evaluation || typeof evaluation !== "object") {
      return false;
    }

    const eval_obj = evaluation as Record<string, unknown>;
    return (
      this.isValidScore(eval_obj.codeQuality) &&
      this.isValidScore(eval_obj.architectureAndState) &&
      this.isValidScore(eval_obj.runtimePerformance) &&
      this.isValidScore(eval_obj.accessibilityAndUX) &&
      typeof eval_obj.overallScore === "number" &&
      typeof eval_obj.summary === "string"
    );
  }

  private isValidScore(score: unknown): score is CodeQualityScore {
    if (!score || typeof score !== "object") {
      return false;
    }

    const score_obj = score as Record<string, unknown>;
    return (
      typeof score_obj.score === "number" &&
      score_obj.score >= 0 &&
      score_obj.score <= 25 &&
      Array.isArray(score_obj.details) &&
      score_obj.details.every((d: unknown) => typeof d === "string")
    );
  }

  destroy(): void {
    this.aiClient.destroy();
  }
}
