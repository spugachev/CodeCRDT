import { randomUUID } from "crypto";
import { InferenceTask, AgentName } from "../types/inference";
import {
  SequentialAgent,
  OutlinerAgent,
  ImplementationAgent,
} from "../../agents";
import { CRDTConnector, TextWriter, ToDoEvent, ToDoObserver } from "../../core";

// Configuration for task cleanup
const MAX_TASKS = 100_000; // Maximum number of tasks to keep in memory
const TASK_RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // Keep completed tasks for 7 days
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // Run cleanup every hour

class InferenceService {
  private tasks: Map<string, InferenceTask> = new Map();
  private cleanupInterval?: NodeJS.Timeout;

  constructor() {
    // Start periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldTasks();
    }, CLEANUP_INTERVAL_MS);

    // Ensure cleanup runs even if process exits
    this.cleanupInterval.unref();
  }

  /**
   * Removes old completed/failed tasks to prevent memory leaks
   */
  private cleanupOldTasks(): void {
    const now = Date.now();
    let removedCount = 0;

    // Remove tasks that have been completed/failed for longer than retention period
    for (const [taskId, task] of this.tasks.entries()) {
      if (
        (task.status === "completed" || task.status === "failed") &&
        now - task.updatedAt.getTime() > TASK_RETENTION_MS
      ) {
        this.tasks.delete(taskId);
        removedCount++;
      }
    }

    // If still over max tasks, remove oldest completed/failed tasks
    if (this.tasks.size > MAX_TASKS) {
      const sortedTasks = Array.from(this.tasks.entries())
        .filter(
          ([_, task]) => task.status === "completed" || task.status === "failed"
        )
        .sort(
          ([_, a], [__, b]) => a.updatedAt.getTime() - b.updatedAt.getTime()
        );

      const toRemove = this.tasks.size - MAX_TASKS;
      for (let i = 0; i < Math.min(toRemove, sortedTasks.length); i++) {
        this.tasks.delete(sortedTasks[i][0]);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(
        `Cleaned up ${removedCount} old tasks. Current task count: ${this.tasks.size}`
      );
    }
  }

  /**
   * Stops the cleanup interval (useful for testing or graceful shutdown)
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  createTask(
    roomId: string,
    prompt: string,
    agentName: AgentName = "outliner"
  ): string {
    const taskId = randomUUID();
    const task: InferenceTask = {
      id: taskId,
      roomId,
      status: "pending",
      prompt,
      agentName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasks.set(taskId, task);

    this.processTaskInBackground(taskId);

    return taskId;
  }

  getTask(taskId: string): InferenceTask | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): InferenceTask[] {
    return Array.from(this.tasks.values());
  }

  private async processTaskInBackground(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = "processing";
    task.updatedAt = new Date();

    const start = process.hrtime.bigint();

    try {
      const clientId = `inference-${randomUUID()}`;
      const connector = new CRDTConnector({
        roomId: task.roomId,
        clientId,
      });

      await connector.connect();

      const textWriter = new TextWriter(connector, clientId);
      const { text } = textWriter.getText();
      let currentText = text.toString();
      const hasCurrentText = currentText.trim().length > 0;

      if (hasCurrentText) {
        textWriter.clearText();
      }

      textWriter.clearSlots();
      currentText = text.toString();

      if (task.agentName === "sequential") {
        // Use sequential agent that handles everything itself
        const sequentialAgent = new SequentialAgent(task, currentText);
        await sequentialAgent.run();
        console.info("SequentialAgent finished generating text");
      } else {
        // Use outliner + implementation agents pattern
        const observer = new ToDoObserver(connector, task);
        observer.observe(async (task: InferenceTask, event: ToDoEvent) => {
          return new ImplementationAgent(task, event).run();
        });

        const outliner = new OutlinerAgent(task, currentText);
        const outlinerConnector = await outliner.run();
        console.info("OutlinerAgent finished generating text");

        // Wait for TODO detection to stabilize (no new TODOs detected for 500ms)
        // Keep outliner connected during this time to ensure changes propagate
        await observer.waitForTodoStabilization();

        console.info(
          `Outliner changes fully synced. Detected ${observer.getTodoCount()} TODOs.`
        );

        await outlinerConnector.disconnect();
        const errors = await observer.waitForAllAndStop();

        if (errors.length > 0) {
          console.warn(
            `⚠️  ${errors.length} TODO implementation(s) failed during processing`
          );

          errors.forEach((err, idx) => {
            console.error(`   Error ${idx + 1}:`, err.error.message);
          });

          // Mark task with partial failure if some implementations failed
          if (errors.length > 0) {
            task.error = `${errors.length} TODO implementation(s) failed. Check logs for details.`;
          }
        }

        console.info("All agents stopped gracefully");
      }

      await connector.disconnect();

      task.status = "completed";
    } catch (error) {
      task.status = "failed";
      task.error =
        error instanceof Error ? error.message : "Unknown error occurred";
    }

    const end = process.hrtime.bigint();
    const durationSec = Number(end - start) / 1e9;
    console.log(`Execution time: ${durationSec.toFixed(3)} s`);

    task.updatedAt = new Date();
  }
}

export const inferenceService = new InferenceService();
