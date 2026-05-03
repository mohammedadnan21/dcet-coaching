"use client";

import { useCachedFetch } from "@/hooks/use-cached-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  GraduationCap,
  BookOpen,
  Video,
  Calendar,
  ClipboardList,
  UserCheck,
  TrendingUp,
} from "lucide-react";

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  pendingApprovals: number;
  totalSubjects: number;
  totalVideos: number;
  upcomingMeetings: number;
  activeTests: number;
}

export default function AdminDashboard() {
  const { data: stats, loading } = useCachedFetch<Stats>("/api/admin/stats");

  const statCards = [
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      icon: GraduationCap,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-900/20",
    },
    {
      title: "Total Teachers",
      value: stats?.totalTeachers || 0,
      icon: Users,
      iconColor: "text-green-500",
      bgColor: "bg-green-900/20",
    },
    {
      title: "Pending Approvals",
      value: stats?.pendingApprovals || 0,
      icon: UserCheck,
      iconColor: "text-orange-500",
      bgColor: "bg-orange-900/20",
      highlight: (stats?.pendingApprovals || 0) > 0,
    },
    {
      title: "Active Subjects",
      value: stats?.totalSubjects || 0,
      icon: BookOpen,
      iconColor: "text-purple-400",
      bgColor: "bg-purple-900/20",
    },
    {
      title: "Total Videos",
      value: stats?.totalVideos || 0,
      icon: Video,
      iconColor: "text-pink-400",
      bgColor: "bg-pink-900/20",
    },
    {
      title: "Upcoming Meetings",
      value: stats?.upcomingMeetings || 0,
      icon: Calendar,
      iconColor: "text-cyan-400",
      bgColor: "bg-cyan-900/20",
    },
    {
      title: "Active Tests",
      value: stats?.activeTests || 0,
      icon: ClipboardList,
      iconColor: "text-indigo-400",
      bgColor: "bg-indigo-900/20",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-stone-400 mt-1">
          Welcome back! Here&apos;s an overview of your platform.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className={`border border-amber-900/15 bg-stone-900 shadow-md ${stat.highlight ? "ring-2 ring-amber-600/50" : ""}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {loading ? "..." : stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
              {stat.highlight && (
                <Badge className="mt-3 bg-amber-900/30 text-amber-400 border border-amber-700/30">Needs Attention</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-amber-900/15 bg-stone-900 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/admin/approvals"
              className="p-4 bg-amber-900/15 rounded-xl text-center hover:bg-amber-900/25 transition-colors border border-amber-900/10"
            >
              <UserCheck className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="font-medium text-white">Review Approvals</p>
            </a>
            <a
              href="/admin/subjects"
              className="p-4 bg-purple-900/15 rounded-xl text-center hover:bg-purple-900/25 transition-colors border border-purple-900/10"
            >
              <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="font-medium text-white">Manage Subjects</p>
            </a>
            <a
              href="/admin/meetings"
              className="p-4 bg-cyan-900/15 rounded-xl text-center hover:bg-cyan-900/25 transition-colors border border-cyan-900/10"
            >
              <Calendar className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="font-medium text-white">Schedule Meeting</p>
            </a>
            <a
              href="/admin/tests"
              className="p-4 bg-indigo-900/15 rounded-xl text-center hover:bg-indigo-900/25 transition-colors border border-indigo-900/10"
            >
              <ClipboardList className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="font-medium text-white">Create Test</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
