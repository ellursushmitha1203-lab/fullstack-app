import { Request, Response } from "express";
import prisma from "../../config/db";

export async function getSubjects(_req: Request, res: Response): Promise<void> {
  try {
    const subjects = await prisma.subject.findMany({
      where: { is_published: true },
      orderBy: { created_at: "desc" },
    });
    res.json(subjects);
  } catch (error) {
    console.error("Get subjects error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getSubjectById(req: Request, res: Response): Promise<void> {
  try {
    const subjectId = req.params.subjectId as string;
    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(subjectId) },
      include: {
        sections: {
          orderBy: { order_index: "asc" },
          include: {
            videos: {
              orderBy: { order_index: "asc" },
            },
          },
        },
      },
    });

    if (!subject) {
      res.status(404).json({ message: "Subject not found" });
      return;
    }

    res.json(subject);
  } catch (error) {
    console.error("Get subject by id error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getSubjectTree(req: Request, res: Response): Promise<void> {
  try {
    const subjectId = req.params.subjectId as string;
    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(subjectId) },
      include: {
        sections: {
          orderBy: { order_index: "asc" },
          include: {
            videos: {
              orderBy: { order_index: "asc" },
            },
          },
        },
      },
    });

    if (!subject) {
      res.status(404).json({ message: "Subject not found" });
      return;
    }

    res.json(subject);
  } catch (error) {
    console.error("Get subject tree error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
