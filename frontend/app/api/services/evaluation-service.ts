import { BaseService } from "./base-service";

export interface CodeQualityScore {
  score: number;
  details: string[];
}

export interface CodeEvaluationRequest {
  code: string;
  language?: "typescript" | "tsx" | "javascript" | "jsx";
}

export interface CodeEvaluationResponse {
  codeQuality: CodeQualityScore;
  architectureAndState: CodeQualityScore;
  runtimePerformance: CodeQualityScore;
  accessibilityAndUX: CodeQualityScore;
  overallScore: number;
  summary: string;
}

export class EvaluationService extends BaseService {
  public async evaluateCode(
    request: CodeEvaluationRequest
  ): Promise<CodeEvaluationResponse> {
    return this.post<CodeEvaluationResponse>("/evaluate", request, {
      timeout: 120_000, // 2 minutes
      retry: {
        enabled: true,
        maxAttempts: 2,
        delay: 1000,
        maxDelay: 5000,
        backoff: "exponential",
      },
    });
  }
}
