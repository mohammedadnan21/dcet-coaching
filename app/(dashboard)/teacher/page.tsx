"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Calendar, ClipboardList, MessageCircle, BookOpen } from "lucide-react";

interface Stats {
  myVideos: number;
  myMeetings: number;
  myTests: number;
  questionsForMe: number;
}

export default function TeacherDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({ myVideos: 0, myMeetings: 0, myTests: 0, questionsForMe: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch various stats
      const [videosRes, meetingsRes, testsRes] = await Promise.all([
        fetch("/api/videos"),
        fetch("/api/meetings?upcoming=true"),
        fetch("/api/tests"),
      ]);

      const videos = await videosRes.json();
      const meetings = await meetingsRes.json();
      const tests = await testsRes.json();

      setStats({
        myVideos: videos.length,
        myMeetings: meetings.length,
        myTests: tests.length,
        questionsForMe: 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "My Videos", value: stats.myVideos, icon: Video, color: "bg-blue-500", bgColor: "bg-blue-50" },
    { title: "Upcoming Meetings", value: stats.myMeetings, icon: Calendar, color: "bg-green-500", bgColor: "bg-green-50" },
    { title: "My Tests", value: stats.myTests, icon: ClipboardList, color: "bg-purple-500", bgColor: "bg-purple-50" },
    { title: "Student Questions", value: stats.questionsForMe, icon: MessageCircle, color: "bg-amber-500", bgColor: "bg-amber-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {session?.user?.name || "Teacher"}!
        </h1>
        <p className="text-gray-600 mt-1">Here's your teaching dashboard overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {loading ? "..." : stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-gray-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/teacher/videos" className="p-4 bg-blue-50 rounded-xl text-center hover:bg-blue-100 transition">
              <Video className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium">Upload Video</p>
            </a>
            <a href="/teacher/meetings" className="p-4 bg-green-50 rounded-xl text-center hover:bg-green-100 transition">
              <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium">Schedule Class</p>
            </a>
            <a href="/teacher/tests" className="p-4 bg-purple-50 rounded-xl text-center hover:bg-purple-100 transition">
              <ClipboardList className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-medium">Create Test</p>
            </a>
            <a href="/teacher/questions" className="p-4 bg-amber-50 rounded-xl text-center hover:bg-amber-100 transition">
              <MessageCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="font-medium">Answer Questions</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
