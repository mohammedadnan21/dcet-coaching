"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Video, ClipboardList, ChevronRight } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  description: string | null;
  _count: { videos: number; mockTests: number };
}

export default function StudentSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects");
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
        <p className="text-gray-600 mt-1">Explore available courses</p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading subjects...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Link key={subject.id} href={`/student/videos?subject=${subject.id}`}>
              <Card className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{subject.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {subject.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="flex gap-4 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Video className="w-4 h-4" />
                      {subject._count.videos} videos
                    </span>
                    <span className="flex items-center gap-1">
                      <ClipboardList className="w-4 h-4" />
                      {subject._count.mockTests} tests
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
