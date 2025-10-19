import { Router, Request, Response } from "express";
import { databaseService } from "../../services/database-service";
import { roomService } from "../../services/room-service";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const pageParam = parseInt(req.query.page as string);
  const pageSizeParam = parseInt(req.query.pageSize as string);

  const page = isNaN(pageParam) ? 1 : pageParam;
  const pageSize = isNaN(pageSizeParam) ? 20 : pageSizeParam;

  if (page < 1 || pageSize < 1 || pageSize > 100) {
    return res.status(400).json({
      error:
        "Invalid pagination parameters. Page must be >= 1, pageSize must be between 1 and 100",
    });
  }

  try {
    const result = databaseService.getDistinctRooms(page, pageSize);
    res.json(result);
  } catch (error) {
    console.error("Failed to retrieve rooms:", error);
    res.status(500).json({ error: "Failed to retrieve rooms" });
  }
});

router.get("/:roomId/text", async (req: Request, res: Response) => {
  const { roomId } = req.params;

  if (!roomId) {
    return res.status(400).json({
      error: "Room ID is required",
    });
  }

  try {
    const result = await roomService.getRoomText(roomId);
    res.json(result);
  } catch (error) {
    console.error("Failed to retrieve room text:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to retrieve room text"
    });
  }
});

router.get("/:roomId/messages", (req: Request, res: Response) => {
  const { roomId } = req.params;
  const pageParam = parseInt(req.query.page as string);
  const pageSizeParam = parseInt(req.query.pageSize as string);

  const page = isNaN(pageParam) ? 1 : pageParam;
  const pageSize = isNaN(pageSizeParam) ? 50 : pageSizeParam;

  if (page < 1 || pageSize < 1 || pageSize > 100) {
    return res.status(400).json({
      error:
        "Invalid pagination parameters. Page must be >= 1, pageSize must be between 1 and 100",
    });
  }

  try {
    const result = databaseService.getRoomMessages(roomId, page, pageSize);
    res.json(result);
  } catch (error) {
    console.error("Failed to retrieve room messages:", error);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
});

router.get("/messages", (req: Request, res: Response) => {
  const pageParam = parseInt(req.query.page as string);
  const pageSizeParam = parseInt(req.query.pageSize as string);

  const page = isNaN(pageParam) ? 1 : pageParam;
  const pageSize = isNaN(pageSizeParam) ? 50 : pageSizeParam;

  if (page < 1 || pageSize < 1 || pageSize > 100) {
    return res.status(400).json({
      error:
        "Invalid pagination parameters. Page must be >= 1, pageSize must be between 1 and 100",
    });
  }

  try {
    const result = databaseService.getAllMessages(page, pageSize);
    res.json(result);
  } catch (error) {
    console.error("Failed to retrieve messages:", error);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
});

export default router;
