import { Router, Request, Response } from "express";
import { EvaluatorAgent } from "../../../agents";

const router = Router();

const VALID_LANGUAGES = ["typescript", "tsx", "javascript", "jsx"];
const EVALUATION_TIMEOUT_MS = 120000; // 2 minutes

router.post("/evaluate", async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      return res.status(400).json({
        error: "Code is required for evaluation",
      });
    }

    // Validate language parameter
    const evalLanguage = language || "typescript";
    if (!VALID_LANGUAGES.includes(evalLanguage)) {
      return res.status(400).json({
        error: `Invalid language. Must be one of: ${VALID_LANGUAGES.join(", ")}`,
      });
    }

    const evaluator = new EvaluatorAgent();

    try {
      // Add timeout protection
      const evaluationPromise = evaluator.evaluateCode({
        code,
        language: evalLanguage,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Evaluation timeout")),
          EVALUATION_TIMEOUT_MS
        )
      );

      const evaluation = await Promise.race([
        evaluationPromise,
        timeoutPromise,
      ]);

      res.json(evaluation);
    } finally {
      evaluator.destroy();
    }
  } catch (error) {
    console.error("Evaluation error:", error);
    res.status(500).json({
      error: "Failed to evaluate code",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;