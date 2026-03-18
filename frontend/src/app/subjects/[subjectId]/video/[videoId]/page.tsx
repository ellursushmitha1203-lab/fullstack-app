"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import VideoPlayer from "@/components/VideoPlayer";
import Sidebar from "@/components/Sidebar";
import Spinner from "@/components/Spinner";
import { useAuthStore } from "@/store/authStore";
import { getVideoProgress } from "@/lib/progress";
import Link from "next/link";

interface Video {
  id: number;
  title: string;
  description: string | null;
  youtube_url: string;
  order_index: number;
  duration_seconds: number;
}

interface Section {
  id: number;
  title: string;
  order_index: number;
  videos: Video[];
}

interface Subject {
  id: number;
  title: string;
  slug: string;
  description: string;
  sections: Section[];
}

export default function VideoPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = parseInt(params.subjectId as string);
  const videoId = parseInt(params.videoId as string);
  const { isAuthenticated, loadFromStorage } = useAuthStore();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialPosition, setInitialPosition] = useState(0);
  const [progressMap, setProgressMap] = useState<Map<number, boolean>>(new Map());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
  }, [loadFromStorage]);

  const loadData = useCallback(async () => {
    try {
      const subRes = await apiClient.get(`/subjects/${subjectId}/tree`);
      setSubject(subRes.data);

      if (localStorage.getItem("accessToken")) {
        // Load progress for current video
        try {
          const prog = await getVideoProgress(videoId);
          setInitialPosition(prog.last_position_seconds || 0);
        } catch {
          setInitialPosition(0);
        }

        // Load all progress
        const allVideos: number[] = [];
        subRes.data.sections.forEach((s: Section) => {
          s.videos.forEach((v: Video) => allVideos.push(v.id));
        });

        const progressPromises = allVideos.map((vid) =>
          apiClient.get(`/progress/videos/${vid}`).catch(() => null)
        );
        const results = await Promise.all(progressPromises);
        const map = new Map<number, boolean>();
        results.forEach((r) => {
          if (r?.data) {
            map.set(r.data.video_id, r.data.is_completed || false);
          }
        });
        setProgressMap(map);
      }
    } catch (error) {
      console.error("Failed to load video data:", error);
    } finally {
      setLoading(false);
    }
  }, [subjectId, videoId]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  if (loading || !mounted) return <Spinner />;

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 mb-4">Please login to watch videos.</p>
        <Link
          href="/auth/login"
          className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Login
        </Link>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Subject not found.</p>
      </div>
    );
  }

  // Build flat video list and find current video
  const completedVideoIds = new Set<number>();
  const unlockedVideoIds = new Set<number>();
  const allVideosOrdered: Video[] = [];

  subject.sections.forEach((section) => {
    section.videos.forEach((video) => {
      allVideosOrdered.push(video);
      if (progressMap.get(video.id)) {
        completedVideoIds.add(video.id);
      }
    });
  });

  allVideosOrdered.forEach((video, idx) => {
    if (idx === 0) {
      unlockedVideoIds.add(video.id);
    } else {
      const prevVideo = allVideosOrdered[idx - 1];
      if (completedVideoIds.has(prevVideo.id)) {
        unlockedVideoIds.add(video.id);
      }
    }
  });

  const currentVideo = allVideosOrdered.find((v) => v.id === videoId);
  const currentIdx = allVideosOrdered.findIndex((v) => v.id === videoId);
  const prevVideo = currentIdx > 0 ? allVideosOrdered[currentIdx - 1] : null;
  const nextVideo = currentIdx < allVideosOrdered.length - 1 ? allVideosOrdered[currentIdx + 1] : null;

  if (!currentVideo || !unlockedVideoIds.has(videoId)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 mb-4">
          This video is locked. Complete the previous video first.
        </p>
        <Link
          href={`/subjects/${subjectId}`}
          className="text-indigo-600 hover:underline font-medium"
        >
          Back to course
        </Link>
      </div>
    );
  }

  const handleComplete = () => {
    // Add current video to completed, reload to update UI
    setProgressMap((prev) => {
      const next = new Map(prev);
      next.set(videoId, true);
      return next;
    });
    completedVideoIds.add(videoId);

    // Auto-play next if available and now unlocked
    if (nextVideo) {
      setTimeout(() => {
        router.push(`/subjects/${subjectId}/video/${nextVideo.id}`);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <Sidebar
        sections={subject.sections}
        subjectId={subjectId}
        completedVideoIds={completedVideoIds}
        unlockedVideoIds={unlockedVideoIds}
      />

      {/* Main content */}
      <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <VideoPlayer
          videoId={videoId}
          youtubeUrl={currentVideo.youtube_url}
          initialPosition={initialPosition}
          onComplete={handleComplete}
        />

        <div className="mt-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {currentVideo.title}
          </h1>
          {currentVideo.description && (
            <p className="text-gray-500 mb-6">{currentVideo.description}</p>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            {prevVideo ? (
              <Link
                href={`/subjects/${subjectId}/video/${prevVideo.id}`}
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Previous</span>
              </Link>
            ) : (
              <div />
            )}

            <Link
              href={`/subjects/${subjectId}`}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Course Overview
            </Link>

            {nextVideo && unlockedVideoIds.has(nextVideo.id) ? (
              <Link
                href={`/subjects/${subjectId}/video/${nextVideo.id}`}
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <span className="text-sm font-medium">Next</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : nextVideo ? (
              <span className="flex items-center gap-2 text-gray-300 cursor-not-allowed">
                <span className="text-sm font-medium">Next</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </span>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
