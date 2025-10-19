import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Progress } from "~/components/ui/progress";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "~/lib/utils";
import { getApi } from "~/api";
import type { CodeEvaluationResponse, CodeQualityScore } from "~/api";

interface CodeQualityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
}

function ScoreSection({
  title,
  score,
  icon,
}: {
  title: string;
  score: CodeQualityScore;
  icon: React.ReactNode;
}) {
  const percentage = (score.score / 25) * 100;
  const color =
    percentage >= 80
      ? "text-green-600"
      : percentage >= 60
        ? "text-yellow-600"
        : percentage >= 40
          ? "text-orange-600"
          : "text-red-600";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-medium">{title}</h3>
        </div>
        <span className={cn("text-lg font-semibold", color)}>
          {score.score}/25
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      <ul className="space-y-1">
        {score.details.map((detail, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/50 flex-shrink-0" />
            {detail}
          </li>
        ))}
      </ul>
    </div>
  );
}

function OverallScore({ score }: { score: number }) {
  const percentage = score;
  const grade =
    percentage >= 90
      ? "A"
      : percentage >= 80
        ? "B"
        : percentage >= 70
          ? "C"
          : percentage >= 60
            ? "D"
            : "F";

  const color =
    percentage >= 80
      ? "text-green-600 border-green-200 bg-green-50"
      : percentage >= 60
        ? "text-yellow-600 border-yellow-200 bg-yellow-50"
        : percentage >= 40
          ? "text-orange-600 border-orange-200 bg-orange-50"
          : "text-red-600 border-red-200 bg-red-50";

  return (
    <div className={cn("rounded-lg border-2 p-6 text-center", color)}>
      <div className="text-4xl font-bold mb-2">{score}/100</div>
      <div className="text-2xl font-semibold mb-1">Grade: {grade}</div>
      <div className="text-sm opacity-80">Overall Code Quality</div>
    </div>
  );
}

export default function CodeQualityDialog({
  open,
  onOpenChange,
  code,
}: CodeQualityDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<CodeEvaluationResponse | null>(
    null
  );

  const evaluateCode = async () => {
    setLoading(true);
    setError(null);

    try {
      const api = getApi();
      const data = await api.evaluation.evaluateCode({
        code,
        language: "tsx",
      });
      setEvaluation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to evaluate code");
    } finally {
      setLoading(false);
    }
  };

  // Auto-evaluate when dialog opens
  if (open && !loading && !evaluation && !error) {
    evaluateCode();
  }

  // Reset state when dialog closes
  if (!open && (evaluation || error)) {
    setEvaluation(null);
    setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-5/6 h-[90vh] grid grid-rows-[auto_1fr]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Code Quality Analysis
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing your code...</p>
          </div>
        ) : (
          <div className="space-y-6 py-4 overflow-scroll">
            {error && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <XCircle className="h-12 w-12 text-destructive" />
                <p className="text-destructive">{error}</p>
                <button
                  onClick={evaluateCode}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {evaluation && (
              <>
                <OverallScore score={evaluation.overallScore} />

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm">{evaluation.summary}</p>
                </div>

                <div className="space-y-6">
                  <ScoreSection
                    title="Code Quality"
                    score={evaluation.codeQuality}
                    icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
                  />

                  <ScoreSection
                    title="Architecture & State Management"
                    score={evaluation.architectureAndState}
                    icon={<AlertCircle className="h-5 w-5 text-primary" />}
                  />

                  <ScoreSection
                    title="Runtime Performance"
                    score={evaluation.runtimePerformance}
                    icon={<AlertCircle className="h-5 w-5 text-primary" />}
                  />

                  <ScoreSection
                    title="Accessibility & UX"
                    score={evaluation.accessibilityAndUX}
                    icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
