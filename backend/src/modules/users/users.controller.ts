import { Response } from "express";
import prisma from "../../config/db";
import { AuthRequest } from "../../middleware/authMiddleware";

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, created_at: true },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getUserProgress(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;

    // Get all subjects with progress info
    const subjects = await prisma.subject.findMany({
      where: { is_published: true },
      include: {
        sections: {
          orderBy: { order_index: "asc" },
          include: {
            videos: {
              orderBy: { order_index: "asc" },
              include: {
                progress: {
                  where: { user_id: userId },
                },
              },
            },
          },
        },
      },
    });

    const progressData = subjects.map((subject: any) => {
      let totalVideos = 0;
      let completedVideos = 0;

      subject.sections.forEach((section: any) => {
        section.videos.forEach((video: any) => {
          totalVideos++;
          if (video.progress.length > 0 && video.progress[0].is_completed) {
            completedVideos++;
          }
        });
      });

      return {
        subject_id: subject.id,
        subject_title: subject.title,
        subject_slug: subject.slug,
        thumbnail: subject.thumbnail,
        total_videos: totalVideos,
        completed_videos: completedVideos,
        progress_percentage:
          totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0,
      };
    });

    res.json(progressData);
  } catch (error) {
    console.error("Get user progress error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
