import { Router } from "express";
import { getProfile, getUserProgress } from "./users.controller";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();

router.get("/me", authMiddleware, getProfile);
router.get("/me/progress", authMiddleware, getUserProgress);

export default router;
