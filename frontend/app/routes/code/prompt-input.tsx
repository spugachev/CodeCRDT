import * as React from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import type { ConnectionState } from "~/hooks/use-collaboration";
import ConnectionStatus from "~/components/connection-status";
import { getApi, ApiError, ErrorCode } from "~/api";
import type { InferenceTask } from "~/api";

const POLL_INTERVAL = 1000;
const POLL_MAX_ATTEMPTS = 5 * 60;
const MAX_TEXTAREA_LINES = 8;
const LINE_HEIGHT = 24;

const TASK_STATUS_TEXT = {
  pending: "Queued...",
  processing: "Processing your request...",
  completed: "Completed!",
  failed: "Failed",
} as const;

const ERROR_MESSAGES: Partial<Record<ErrorCode, string>> = {
  [ErrorCode.NETWORK_ERROR]: "Network error. Please check your connection.",
  [ErrorCode.TIMEOUT]: "Request timed out. Please try again.",
  [ErrorCode.UNAUTHORIZED]: "Authentication required. Please log in.",
  [ErrorCode.SERVER_ERROR]: "Server error. Please try again later.",
  [ErrorCode.VALIDATION_ERROR]: "Invalid prompt. Please check your input.",
  [ErrorCode.CANCELLED]: "Request was cancelled.",
};

interface TaskState {
  isSubmitting: boolean;
  isProcessing: boolean;
  currentTaskId: string | null;
  error: string | null;
  progress: string | null;
}

const INITIAL_TASK_STATE: TaskState = {
  isSubmitting: false,
  isProcessing: false,
  currentTaskId: null,
  error: null,
  progress: null,
};

interface PromptInputProps {
  roomId: string;
  connectionState: ConnectionState;
  onTaskComplete?: (task: InferenceTask) => void;
  onTaskError?: (error: Error) => void;
}

export default function PromptInput({
  roomId,
  connectionState,
  onTaskComplete,
  onTaskError,
}: PromptInputProps) {
  const [value, setValue] = React.useState("");
  const [taskState, setTaskState] =
    React.useState<TaskState>(INITIAL_TASK_STATE);
  const [agentMode, setAgentMode] = React.useState<"parallel" | "sequential">(() => {
    const stored = localStorage.getItem("agentMode");
    return stored === "sequential" ? "sequential" : "parallel";
  });

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const isLoading = taskState.isSubmitting || taskState.isProcessing;
  const isDisconnected =
    connectionState.status !== "connected" || !connectionState.isSynced;

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof ApiError) {
      return (
        ERROR_MESSAGES[error.code] ||
        error.message ||
        "Failed to process prompt"
      );
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "An unexpected error occurred";
  };

  const submitPrompt = React.useCallback(async () => {
    const prompt = value.trim();
    if (!prompt || isLoading || isDisconnected) return;

    setTaskState((prev) => ({ ...prev, error: null }));

    try {
      setTaskState((prev) => ({
        ...prev,
        isSubmitting: true,
        progress: "Submitting prompt...",
      }));

      const api = getApi();
      const agentName = agentMode === "parallel" ? "outliner" : "sequential";
      const { taskId } = await api.task.submit(roomId, prompt, agentName);

      setValue("");

      setTaskState((prev) => ({
        ...prev,
        isSubmitting: false,
        isProcessing: true,
        currentTaskId: taskId,
        progress: "Processing...",
      }));

      abortControllerRef.current = new AbortController();

      const completedTask = await api.task.pollTask(taskId, {
        interval: POLL_INTERVAL,
        maxAttempts: POLL_MAX_ATTEMPTS,
        signal: abortControllerRef.current.signal,
        onProgress: (task) => {
          const progressText = TASK_STATUS_TEXT[task.status] || "Processing...";
          setTaskState((prev) => ({ ...prev, progress: progressText }));
        },
      });

      setTaskState(INITIAL_TASK_STATE);
      onTaskComplete?.(completedTask);
    } catch (error) {
      console.error("Error processing prompt:", error);

      const errorMessage = getErrorMessage(error);

      setTaskState({
        ...INITIAL_TASK_STATE,
        error: errorMessage,
      });

      onTaskError?.(error as Error);
    } finally {
      abortControllerRef.current = null;
    }
  }, [value, isLoading, isDisconnected, roomId, agentMode, onTaskComplete, onTaskError]);

  const cancelTask = React.useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setTaskState(INITIAL_TASK_STATE);
  }, []);

  const handleSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      void submitPrompt();
    },
    [submitPrompt]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !isLoading && !isDisconnected) {
        e.preventDefault();
        void submitPrompt();
      }
    },
    [isLoading, isDisconnected, submitPrompt]
  );

  const clearError = React.useCallback(() => {
    setTaskState((prev) => ({ ...prev, error: null }));
  }, []);

  React.useEffect(() => {
    if (value && taskState.error) {
      clearError();
    }
  }, [value, taskState.error, clearError]);

  React.useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = LINE_HEIGHT * MAX_TEXTAREA_LINES;
    textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  }, [value]);

  React.useEffect(() => {
    localStorage.setItem("agentMode", agentMode);
  }, [agentMode]);

  const inputPlaceholder = isLoading
    ? "Processing your request..."
    : "Enter prompt to create react page";

  const buttonAriaLabel = taskState.isProcessing
    ? "Cancel"
    : taskState.isSubmitting
      ? "Submitting..."
      : "Send";

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="relative mx-auto w-full max-w-4xl px-6 pb-6">
        <div className="pointer-events-auto">
          <form
            onSubmit={handleSubmit}
            className={`
              relative flex items-end gap-2 rounded-2xl border bg-background/95 
              shadow-2xl backdrop-blur-xl transition-all duration-300
              ${
                isLoading
                  ? "border-primary/40 opacity-80"
                  : "border-border/40 hover:border-border/60 focus-within:border-primary/40"
              }
              focus-within:shadow-[0_0_40px_rgba(0,0,0,0.1)] 
              dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] 
              dark:focus-within:shadow-[0_0_40px_rgba(255,255,255,0.05)]
            `}
          >
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                id="prompt"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={inputPlaceholder}
                disabled={isLoading || isDisconnected}
                className="
                  min-h-[48px] max-h-[200px] resize-none overflow-y-auto overflow-x-hidden 
                  break-words border-0 bg-transparent px-5 py-3.5 text-base leading-6 
                  placeholder:text-muted-foreground/50 focus:outline-none focus-visible:ring-0 
                  scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent 
                  disabled:cursor-not-allowed disabled:opacity-60
                "
                wrap="soft"
                spellCheck
                aria-label="Prompt input"
                aria-describedby="prompt-hint"
                aria-busy={isLoading}
                aria-invalid={!!taskState.error}
                style={{ overflowWrap: "anywhere" }}
              />
            </div>
            <Button
              type={taskState.isProcessing ? "button" : "submit"}
              onClick={taskState.isProcessing ? cancelTask : undefined}
              disabled={
                taskState.isProcessing
                  ? false
                  : !value.trim() || isDisconnected || taskState.isSubmitting
              }
              className="
                mb-2.5 mr-2.5 h-9 w-9 rounded-xl bg-primary hover:bg-primary/90 
                transition-all duration-200 disabled:opacity-40 p-0 
                flex items-center justify-center
              "
              size="icon"
              aria-label={buttonAriaLabel}
            >
              {taskState.isProcessing ? (
                <CancelIcon />
              ) : taskState.isSubmitting ? (
                <SpinnerIcon />
              ) : (
                <SendIcon />
              )}
            </Button>
          </form>

          <div className="mt-2 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <ConnectionStatus connectionState={connectionState} />
              <AgentModeToggle mode={agentMode} onModeChange={setAgentMode} />
            </div>
            <div className="text-[10px] text-muted-foreground/40">
              {taskState.error ? (
                <div className="flex items-center gap-2 text-destructive">
                  <span>{taskState.error}</span>
                  <button
                    onClick={clearError}
                    className="hover:text-destructive/80"
                    aria-label="Dismiss error"
                  >
                    <CloseIcon />
                  </button>
                </div>
              ) : taskState.progress ? (
                <div className="flex items-center gap-2">
                  <SpinnerIcon />
                  <span>{taskState.progress}</span>
                </div>
              ) : (
                "Press Enter to send • Shift+Enter for new line"
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SendIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

function CancelIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function SpinnerIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-3 w-3 animate-spin ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="h-3 w-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

interface AgentModeToggleProps {
  mode: "parallel" | "sequential";
  onModeChange: (mode: "parallel" | "sequential") => void;
}

function AgentModeToggle({ mode, onModeChange }: AgentModeToggleProps) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm transition-all duration-500 ease-in-out">
      <svg
        className="w-3 h-3 text-indigo-500/80"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {mode === "parallel" ? (
          <>
            <path d="M16 3h5v5" />
            <path d="M8 3H3v5" />
            <path d="M12 8v13" />
            <path d="m8 19-5 5" />
            <path d="m16 19 5 5" />
          </>
        ) : (
          <>
            <path d="M12 5v14" />
            <path d="m7 10 5 5 5-5" />
          </>
        )}
      </svg>
      <button
        onClick={() => onModeChange(mode === "parallel" ? "sequential" : "parallel")}
        className="text-[10px] font-semibold tracking-wider uppercase text-indigo-500/80 hover:text-indigo-500 transition-colors cursor-pointer"
        aria-label={`Switch to ${mode === "parallel" ? "sequential" : "parallel"} mode`}
      >
        {mode === "parallel" ? "Parallel" : "Sequential"}
      </button>
    </div>
  );
}
