import { Router } from "express";
import healthRouter from "./health";
import tasksRouter from "./tasks";
import roomsRouter from "./rooms";
import evaluationRouter from "./evaluation";

const router = Router();

router.use("/health", healthRouter);
router.use("/tasks", tasksRouter);
router.use("/rooms", roomsRouter);
router.use("/evaluation", evaluationRouter);

export default router;
