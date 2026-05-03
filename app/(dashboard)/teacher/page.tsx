"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Calendar, ClipboardList, MessageCircle } from "lucide-react";

interface Stats {
  myVideos: number;
  myMeetings: number;
  myTests: number;
  questionsForMe: number;
}

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Stats>({ myVideos: 0, myMeetings: 0, myTests: 0, questionsForMe: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated" || !session?.user?.id) {
      setLoading(false);
      return;
    }

    const userId = session.user.id;

    const fetchStats = async () => {
      try {
        const [videosRes, meetingsRes, testsRes, questionsRes] = await Promise.all([
          fetch("/api/videos?limit=100"),
          fetch("/api/meetings?upcoming=true&limit=100"),
          fetch("/api/tests?limit=100"),
          fetch("/api/questions?limit=100"),
        ]);

        if (!videosRes.ok) throw new Error("Failed to fetch");
        const videosPayload = await videosRes.json();
        if (!meetingsRes.ok) throw new Error("Failed to fetch");
        const meetingsPayload = await meetingsRes.json();
        if (!testsRes.ok) throw new Error("Failed to fetch");
        const tests = await testsRes.json();
        if (!questionsRes.ok) throw new Error("Failed to fetch");
        const questionsPayload = await questionsRes.json();

        const videos = videosPayload?.items ?? [];
        const meetings = meetingsPayload?.items ?? [];
        const questions = questionsPayload?.items ?? [];

        const myVideos = videos.filter((v: { uploader?: { id: string } }) => v.uploader?.id === userId).length;
        const myMeetings = meetings.filter((m: { host?: { id: string } }) => m.host?.id === userId).length;
        const myTests = Array.isArray(tests)
          ? tests.filter((t: { creator?: { id: string } }) => t.creator?.id === userId).length
          : 0;
        const questionsForMe =
          typeof questionsPayload?.total === "number" ? questionsPayload.total : questions.length;

        setStats({
          myVideos,
          myMeetings,
          myTests,
          questionsForMe,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchStats();
  }, [status, session?.user?.id]);

  const statCards = [
    { title: "My Videos", value: stats.myVideos, icon: Video, bgColor: "bg-amber-900/15", iconClass: "text-amber-500" },
    { title: "Upcoming Meetings", value: stats.myMeetings, icon: Calendar, bgColor: "bg-stone-800/50", iconClass: "text-emerald-400" },
    { title: "My Tests", value: stats.myTests, icon: ClipboardList, bgColor: "bg-stone-800/50", iconClass: "text-violet-400" },
    { title: "Student Questions", value: stats.questionsForMe, icon: MessageCircle, bgColor: "bg-amber-900/25", iconClass: "text-amber-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome, {session?.user?.name || "Teacher"}!
        </h1>
        <p className="text-stone-400 mt-1">Here's your teaching dashboard overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="border border-amber-900/15 bg-stone-900 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {loading ? "..." : stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconClass}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-amber-900/15 bg-stone-900 shadow-md">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/teacher/videos" className="p-4 bg-amber-900/15 rounded-xl text-center hover:bg-amber-900/25 transition border border-amber-900/15">
              <Video className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="font-medium text-white">Upload Video</p>
            </a>
            <a href="/teacher/meetings" className="p-4 bg-stone-800/50 rounded-xl text-center hover:bg-stone-800/80 transition border border-amber-900/15">
              <Calendar className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-medium text-white">Schedule Class</p>
            </a>
            <a href="/teacher/tests" className="p-4 bg-stone-800/50 rounded-xl text-center hover:bg-stone-800/80 transition border border-amber-900/15">
              <ClipboardList className="w-8 h-8 text-violet-400 mx-auto mb-2" />
              <p className="font-medium text-white">Create Test</p>
            </a>
            <a href="/teacher/questions" className="p-4 bg-amber-900/15 rounded-xl text-center hover:bg-amber-900/25 transition border border-amber-900/15">
              <MessageCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="font-medium text-white">Answer Questions</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
