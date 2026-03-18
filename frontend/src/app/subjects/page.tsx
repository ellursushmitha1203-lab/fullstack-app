"use client";

import { useEffect, useState } from "react";
import SubjectCard from "@/components/SubjectCard";
import Spinner from "@/components/Spinner";
import apiClient from "@/lib/apiClient";

interface Subject {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/subjects")
      .then((res) => setSubjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">All Courses</h1>
      <p className="text-gray-500 mb-8">Browse our complete course catalog</p>

      {loading ? (
        <Spinner />
      ) : subjects.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No courses available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              id={subject.id}
              title={subject.title}
              description={subject.description}
              thumbnail={subject.thumbnail}
              slug={subject.slug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
