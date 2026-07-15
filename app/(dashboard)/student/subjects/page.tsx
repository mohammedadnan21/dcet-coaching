"use client";

import Link from "next/link";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Video, ClipboardList, ChevronRight } from "lucide-react";
import { fetcher } from "@/lib/fetcher";

interface Subject {
  id: string;
  name: string;
  description: string | null;
  _count: { videos: number; mockTests: number };
}

export default function StudentSubjectsPage() {
  const { data: subjects, isLoading: loading } = useSWR<Subject[]>(
    "/api/subjects",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Subjects</h1>
        <p className="text-stone-400 mt-1">Explore available courses</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-400">Loading subjects...</div>
      ) : !subjects || subjects.length === 0 ? (
        <Card className="border border-amber-900/15 bg-stone-900 shadow-md">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-16 h-16 text-stone-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Subjects Available</h3>
            <p className="text-stone-400">No subjects have been added yet. Check back later.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Link key={subject.id} href={`/student/videos?subject=${subject.id}`}>
              <Card className="border border-amber-900/15 bg-stone-900 shadow-md hover:shadow-xl transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-amber-900/25 rounded-xl flex items-center justify-center group-hover:bg-amber-900/40 transition-colors">
                        <BookOpen className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-white">{subject.name}</h3>
                        <p className="text-sm text-stone-500 line-clamp-1">
                          {subject.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-500 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <div className="flex gap-4 mt-4 text-sm text-stone-500">
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
