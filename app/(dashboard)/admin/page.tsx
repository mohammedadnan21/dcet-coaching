"use client";

import { useState, useEffect } from "react";
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
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      icon: GraduationCap,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Teachers",
      value: stats?.totalTeachers || 0,
      icon: Users,
      color: "bg-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Approvals",
      value: stats?.pendingApprovals || 0,
      icon: UserCheck,
      color: "bg-amber-500",
      bgColor: "bg-amber-50",
      highlight: (stats?.pendingApprovals || 0) > 0,
    },
    {
      title: "Active Subjects",
      value: stats?.totalSubjects || 0,
      icon: BookOpen,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Videos",
      value: stats?.totalVideos || 0,
      icon: Video,
      color: "bg-pink-500",
      bgColor: "bg-pink-50",
    },
    {
      title: "Upcoming Meetings",
      value: stats?.upcomingMeetings || 0,
      icon: Calendar,
      color: "bg-cyan-500",
      bgColor: "bg-cyan-50",
    },
    {
      title: "Active Tests",
      value: stats?.activeTests || 0,
      icon: ClipboardList,
      color: "bg-indigo-500",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's an overview of your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className={`border-0 shadow-md ${stat.highlight ? "ring-2 ring-amber-400" : ""}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {loading ? "..." : stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color.replace("bg-", "")}`} />
                </div>
              </div>
              {stat.highlight && (
                <Badge className="mt-3 bg-amber-100 text-amber-700">Needs Attention</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/admin/approvals"
              className="p-4 bg-amber-50 rounded-xl text-center hover:bg-amber-100 transition-colors"
            >
              <UserCheck className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Review Approvals</p>
            </a>
            <a
              href="/admin/subjects"
              className="p-4 bg-purple-50 rounded-xl text-center hover:bg-purple-100 transition-colors"
            >
              <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Manage Subjects</p>
            </a>
            <a
              href="/admin/meetings"
              className="p-4 bg-cyan-50 rounded-xl text-center hover:bg-cyan-100 transition-colors"
            >
              <Calendar className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Schedule Meeting</p>
            </a>
            <a
              href="/admin/tests"
              className="p-4 bg-indigo-50 rounded-xl text-center hover:bg-indigo-100 transition-colors"
            >
              <ClipboardList className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Create Test</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
