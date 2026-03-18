"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

interface Video {
  id: number;
  title: string;
  order_index: number;
  duration_seconds: number;
}

interface Section {
  id: number;
  title: string;
  order_index: number;
  videos: Video[];
}

interface SidebarProps {
  sections: Section[];
  subjectId: number;
  completedVideoIds: Set<number>;
  unlockedVideoIds: Set<number>;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Sidebar({
  sections,
  subjectId,
  completedVideoIds,
  unlockedVideoIds,
}: SidebarProps) {
  const params = useParams();
  const currentVideoId = params?.videoId ? parseInt(params.videoId as string) : null;

  return (
    <aside className="w-full lg:w-80 bg-white border-r border-gray-200 overflow-y-auto max-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Course Content
        </h2>
        {sections.map((section) => (
          <div key={section.id} className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 px-2">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.videos.map((video) => {
                const isCompleted = completedVideoIds.has(video.id);
                const isUnlocked = unlockedVideoIds.has(video.id);
                const isCurrent = currentVideoId === video.id;

                return (
                  <li key={video.id}>
                    {isUnlocked ? (
                      <Link
                        href={`/subjects/${subjectId}/video/${video.id}`}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          isCurrent
                            ? "bg-indigo-50 text-indigo-700 font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span className="flex-shrink-0">
                          {isCompleted ? (
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </span>
                        <span className="flex-1 truncate">{video.title}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatDuration(video.duration_seconds)}
                        </span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 cursor-not-allowed">
                        <span className="flex-shrink-0">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span className="flex-1 truncate">{video.title}</span>
                        <span className="text-xs flex-shrink-0">
                          {formatDuration(video.duration_seconds)}
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
