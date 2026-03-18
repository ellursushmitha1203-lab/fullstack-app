"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getProfile, getUserProgress } from "@/lib/auth";
import ProgressBar from "@/components/ProgressBar";
import Spinner from "@/components/Spinner";
import Link from "next/link";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface CourseProgress {
  subject_id: number;
  subject_title: string;
  subject_slug: string;
  thumbnail: string | null;
  total_videos: number;
  completed_videos: number;
  progress_percentage: number;
}

export default function ProfilePage() {
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
  }, [loadFromStorage]);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    Promise.all([getProfile(), getUserProgress()])
      .then(([profileData, progressData]) => {
        setProfile(profileData);
        setProgress(progressData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated, mounted, router]);

  if (!mounted || loading) return <Spinner />;

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Failed to load profile.</p>
      </div>
    );
  }

  const totalVideos = progress.reduce((sum, p) => sum + p.total_videos, 0);
  const completedVideos = progress.reduce((sum, p) => sum + p.completed_videos, 0);
  const overallPercentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-indigo-600">
              {profile.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
            <p className="text-gray-500">{profile.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              Joined {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Courses Enrolled</p>
          <p className="text-2xl font-bold text-gray-900">
            {progress.filter((p) => p.completed_videos > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Videos Completed</p>
          <p className="text-2xl font-bold text-gray-900">
            {completedVideos} / {totalVideos}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Overall Progress</p>
          <p className="text-2xl font-bold text-gray-900">{overallPercentage}%</p>
        </div>
      </div>

      {/* Course Progress */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Progress</h2>
      {progress.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500 mb-4">You haven&apos;t started any courses yet.</p>
          <Link
            href="/subjects"
            className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {progress.map((course) => (
            <Link
              key={course.subject_id}
              href={`/subjects/${course.subject_id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.subject_title}
                    className="w-20 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {course.subject_title}
                  </h3>
                  <p className="text-xs text-gray-400 mb-2">
                    {course.completed_videos} of {course.total_videos} videos completed
                  </p>
                  <ProgressBar percentage={course.progress_percentage} size="sm" showLabel={false} />
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-lg font-bold ${
                    course.progress_percentage === 100 ? "text-green-500" : "text-indigo-600"
                  }`}>
                    {course.progress_percentage}%
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
