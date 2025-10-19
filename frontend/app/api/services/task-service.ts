import { BaseService } from "./base-service";
import type {
  InferenceTask,
  CreateInferenceTaskRequest,
  InferenceTaskResponse,
  AgentName,
} from "../types";

export interface PollOptions {
  interval?: number;
  maxAttempts?: number;
  onProgress?: (task: InferenceTask) => void;
  signal?: AbortSignal;
}

export class TaskService extends BaseService {
  public async submit(
    roomId: string,
    prompt: string,
    agentName?: AgentName
  ): Promise<InferenceTaskResponse> {
    const request: CreateInferenceTaskRequest = { roomId, prompt, agentName };
    return this.post<InferenceTaskResponse>("/", request, {
      retry: {
        enabled: true,
        maxAttempts: 3,
        delay: 1000,
        maxDelay: 5000,
        backoff: "exponential",
      },
    });
  }

  public async getTask(taskId: string): Promise<InferenceTask> {
    return this.get<InferenceTask>(`/${taskId}`, {
      cache: { enabled: true, ttl: 2000 },
    });
  }

  public async getAllTasks(): Promise<InferenceTask[]> {
    return this.get<InferenceTask[]>("/", {
      cache: { enabled: true, ttl: 5000 },
    });
  }

  public async pollTask(
    taskId: string,
    options: PollOptions = {}
  ): Promise<InferenceTask> {
    const { interval = 1000, maxAttempts = 60, onProgress, signal } = options;

    let attempts = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return new Promise((resolve, reject) => {
      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      const checkTask = async () => {
        if (signal?.aborted) {
          cleanup();
          reject(new Error("Polling aborted"));
          return;
        }

        try {
          attempts++;
          const task = await this.getTask(taskId);

          if (onProgress) {
            try {
              onProgress(task);
            } catch (progressError) {
              console.error("Error in progress callback:", progressError);
            }
          }

          if (task.status === "completed") {
            cleanup();
            resolve(task);
            return;
          }

          if (task.status === "failed") {
            cleanup();
            reject(new Error(task.error || "Task failed"));
            return;
          }

          if (attempts >= maxAttempts) {
            cleanup();
            reject(
              new Error(`Task polling timeout after ${maxAttempts} attempts`)
            );
            return;
          }

          timeoutId = setTimeout(checkTask, interval);
        } catch (error) {
          cleanup();
          reject(error);
        }
      };

      // Add abort listener if signal provided
      if (signal) {
        signal.addEventListener("abort", () => {
          cleanup();
          reject(new Error("Polling aborted"));
        });
      }

      checkTask();
    });
  }

  public async submitAndWait(
    roomId: string,
    prompt: string,
    agentName?: AgentName,
    pollOptions?: PollOptions
  ): Promise<InferenceTask> {
    const { taskId } = await this.submit(roomId, prompt, agentName);
    return this.pollTask(taskId, pollOptions);
  }

  public async cancelTask(taskId: string): Promise<void> {
    await this.delete(`/${taskId}`);
  }

  public async retryTask(taskId: string): Promise<InferenceTaskResponse> {
    return this.post<InferenceTaskResponse>(`/${taskId}/retry`);
  }
}
