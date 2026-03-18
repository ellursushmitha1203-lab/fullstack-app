import { Router } from "express";
import { getProgress, updateProgress } from "./progress.controller";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();

router.get("/videos/:videoId", authMiddleware, getProgress);
router.post("/videos/:videoId", authMiddleware, updateProgress);

export default router;
