import { Router } from "express";
import { register, login, refresh, logout } from "./auth.controller";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", authMiddleware, logout);

export default router;
