import { Router } from "express";
import { getSubjects, getSubjectById, getSubjectTree } from "./subjects.controller";

const router = Router();

router.get("/", getSubjects);
router.get("/:subjectId", getSubjectById);
router.get("/:subjectId/tree", getSubjectTree);

export default router;
