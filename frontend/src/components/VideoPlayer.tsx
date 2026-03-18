"use client";

import { useEffect, useRef, useCallback } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import { updateVideoProgress } from "@/lib/progress";

interface VideoPlayerProps {
  videoId: number;
  youtubeUrl: string;
  initialPosition: number;
  onComplete: () => void;
}

function extractYouTubeId(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : "";
}

export default function VideoPlayer({
  videoId,
  youtubeUrl,
  initialPosition,
  onComplete,
}: VideoPlayerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCompletedRef = useRef(false);

  const youtubeId = extractYouTubeId(youtubeUrl);

  const saveProgress = useCallback(
    async (completed = false) => {
      if (!playerRef.current) return;
      try {
        const currentTime = Math.floor(playerRef.current.getCurrentTime());
        await updateVideoProgress(videoId, {
          last_position_seconds: currentTime,
          is_completed: completed,
        });
        if (completed && !hasCompletedRef.current) {
          hasCompletedRef.current = true;
          onComplete();
        }
      } catch (err) {
        console.error("Failed to save progress:", err);
      }
    },
    [videoId, onComplete]
  );

  useEffect(() => {
    hasCompletedRef.current = false;
    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [videoId]);

  const onReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    if (initialPosition > 0) {
      event.target.seekTo(initialPosition, true);
    }
  };

  const onPlay = () => {
    // Save progress every 10 seconds
    if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    saveIntervalRef.current = setInterval(() => saveProgress(false), 10000);
  };

  const onPause = () => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }
    saveProgress(false);
  };

  const onEnd = () => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }
    saveProgress(true);
  };

  if (!youtubeId) {
    return (
      <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
        <p className="text-gray-400">Invalid YouTube URL</p>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black rounded-xl overflow-hidden">
      <YouTube
        videoId={youtubeId}
        opts={{
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 0,
            modestbranding: 1,
            rel: 0,
          },
        }}
        onReady={onReady}
        onPlay={onPlay}
        onPause={onPause}
        onEnd={onEnd}
        className="w-full h-full"
        iframeClassName="w-full h-full"
      />
    </div>
  );
}
