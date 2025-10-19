import { Router, Request, Response } from "express";
import { inferenceService } from "../../services/inference-service";
import { databaseService } from "../../services/database-service";
import type {
  CreateInferenceTaskRequest,
  InferenceTaskResponse,
} from "../../types/inference";

const router = Router();

router.get("/", (_: Request, res: Response) => {
  const tasks = inferenceService.getAllTasks();
  res.json(tasks);
});

router.post(
  "/",
  (
    req: Request<{}, {}, CreateInferenceTaskRequest>,
    res: Response<InferenceTaskResponse>
  ) => {
    const { roomId, prompt, agentName } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        taskId: "",
        error: "Prompt is required and must be a string",
      } as InferenceTaskResponse & { error: string });
    }

    if (agentName && agentName !== "outliner" && agentName !== "sequential") {
      return res.status(400).json({
        taskId: "",
        error: "Invalid agentName. Must be 'outliner' or 'sequential'",
      } as InferenceTaskResponse & { error: string });
    }

    let storageWarning: string | undefined;
    try {
      databaseService.addRoomMessage(roomId, prompt, agentName);
      console.log(
        `Stored message for room ${roomId} with agent ${
          agentName || "outliner"
        }: ${prompt.substring(0, 50)}...`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to store room message:", errorMessage);
      storageWarning = `Message storage failed: ${errorMessage}`;
    }

    const taskId = inferenceService.createTask(roomId, prompt, agentName);

    const response: InferenceTaskResponse & { warning?: string } = {
      taskId,
      roomId,
    };

    if (storageWarning) {
      response.warning = storageWarning;
    }

    res.status(201).json(response);
  }
);

router.get("/:taskId", (req: Request, res: Response) => {
  const { taskId } = req.params;

  const task = inferenceService.getTask(taskId);

  if (!task) {
    return res.status(404).json({
      error: "Task not found",
    });
  }

  res.json(task);
});

export default router;
