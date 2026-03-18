import { Response } from "express";
import prisma from "../../config/db";
import { AuthRequest } from "../../middleware/authMiddleware";

export async function getProgress(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const videoId = parseInt(req.params.videoId as string);

    const progress = await prisma.videoProgress.findUnique({
      where: {
        user_id_video_id: { user_id: userId, video_id: videoId },
      },
    });

    res.json(
      progress || {
        user_id: userId,
        video_id: videoId,
        last_position_seconds: 0,
        is_completed: false,
        completed_at: null,
      }
    );
  } catch (error) {
    console.error("Get progress error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateProgress(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const videoId = parseInt(req.params.videoId as string);
    const { last_position_seconds, is_completed } = req.body;

    const data: any = {
      last_position_seconds: last_position_seconds || 0,
      is_completed: is_completed || false,
    };

    if (is_completed) {
      data.completed_at = new Date();
    }

    const progress = await prisma.videoProgress.upsert({
      where: {
        user_id_video_id: { user_id: userId, video_id: videoId },
      },
      update: data,
      create: {
        user_id: userId,
        video_id: videoId,
        ...data,
      },
    });

    res.json(progress);
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
