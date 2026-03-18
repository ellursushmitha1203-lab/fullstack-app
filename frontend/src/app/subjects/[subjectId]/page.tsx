"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import apiClient from "@/lib/apiClient";
import Sidebar from "@/components/Sidebar";
import Spinner from "@/components/Spinner";
import ProgressBar from "@/components/ProgressBar";
import { useAuthStore } from "@/store/authStore";
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
  thumbnail: string | null;
  sections: Section[];
}

export default function SubjectDetailPage() {
  const params = useParams();
  const subjectId = parseInt(params.subjectId as string);
  const { isAuthenticated, loadFromStorage } = useAuthStore();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
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

      // Load progress if authenticated
      if (localStorage.getItem("accessToken")) {
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
      console.error("Failed to load subject:", error);
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading || !mounted) return <Spinner />;
  if (!subject) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Subject not found.</p>
      </div>
    );
  }

  // Calculate completions and unlocked status
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

  // First video is always unlocked, rest depend on previous completion
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

  const totalVideos = allVideosOrdered.length;
  const completedCount = completedVideoIds.size;
  const progressPercentage = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;

  const firstUnlockedVideo = allVideosOrdered.find(
    (v) => unlockedVideoIds.has(v.id) && !completedVideoIds.has(v.id)
  ) || allVideosOrdered[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Subject header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {subject.thumbnail && (
            <div className="lg:w-72 flex-shrink-0">
              <img
                src={subject.thumbnail}
                alt={subject.title}
                className="w-full rounded-xl object-cover aspect-video"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {subject.title}
            </h1>
            <p className="text-gray-500 mb-4">{subject.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span>{subject.sections.length} sections</span>
              <span>{totalVideos} videos</span>
            </div>

            {isAuthenticated && (
              <div className="mb-4 max-w-sm">
                <ProgressBar percentage={progressPercentage} />
              </div>
            )}

            {isAuthenticated && firstUnlockedVideo ? (
              <Link
                href={`/subjects/${subjectId}/video/${firstUnlockedVideo.id}`}
                className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                {completedCount > 0 ? "Continue Learning" : "Start Course"}
              </Link>
            ) : !isAuthenticated ? (
              <Link
                href="/auth/login"
                className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Login to Start Learning
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Course content */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-80 flex-shrink-0">
          <Sidebar
            sections={subject.sections}
            subjectId={subjectId}
            completedVideoIds={completedVideoIds}
            unlockedVideoIds={unlockedVideoIds}
          />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Overview</h2>
          {subject.sections.map((section) => (
            <div key={section.id} className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.videos.map((video) => {
                  const isCompleted = completedVideoIds.has(video.id);
                  const isUnlocked = unlockedVideoIds.has(video.id);
                  return (
                    <div
                      key={video.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        isCompleted
                          ? "border-green-200 bg-green-50"
                          : isUnlocked
                          ? "border-gray-200 bg-white"
                          : "border-gray-100 bg-gray-50 opacity-60"
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : !isUnlocked ? (
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      <span className="flex-1 text-sm text-gray-700">{video.title}</span>
                      <span className="text-xs text-gray-400">
                        {Math.floor(video.duration_seconds / 60)} min
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
