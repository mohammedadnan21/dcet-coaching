"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Calendar, ClipboardList, MessageCircle, Trophy, Bot, Play, Clock } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  scheduledAt: string;
  zoomLink: string;
}

interface Quote {
  quote: string;
  author: string;
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [meetingsRes, quoteRes] = await Promise.all([
        fetch("/api/meetings?upcoming=true"),
        fetch("/api/quotes/random"),
      ]);

      if (!meetingsRes.ok) throw new Error("Failed to fetch");
      const data = await meetingsRes.json();
      setUpcomingMeetings((data.items || []).slice(0, 3));

      if (!quoteRes.ok) throw new Error("Failed to fetch");
      const quoteData = await quoteRes.json();
      setQuote(quoteData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { href: "/student/videos", label: "Watch Videos", icon: Video, color: "bg-amber-900/15", iconColor: "text-amber-500" },
    { href: "/student/meetings", label: "Live Classes", icon: Calendar, color: "bg-green-900/15", iconColor: "text-green-500" },
    { href: "/student/tests", label: "Take Test", icon: ClipboardList, color: "bg-purple-900/15", iconColor: "text-purple-400" },
    { href: "/student/ask", label: "Ask Question", icon: MessageCircle, color: "bg-orange-900/15", iconColor: "text-orange-400" },
    { href: "/student/rankings", label: "View Rankings", icon: Trophy, color: "bg-pink-900/15", iconColor: "text-pink-400" },
    { href: "/student/chatbot", label: "AI Assistant", icon: Bot, color: "bg-cyan-900/15", iconColor: "text-cyan-400" },
  ];

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-amber-900/40 via-amber-800/20 to-stone-900 rounded-2xl p-6 text-white border border-amber-800/20">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Welcome back, {session?.user?.name?.split(" ")[0] || "Student"}!
        </h1>
        <p className="text-amber-200/70">Continue your DCET preparation journey.</p>
      </div>

      {/* Motivation Quote */}
      {quote && (
        <Card className="border border-amber-900/20 bg-stone-900 shadow-md">
          <CardContent className="p-6">
            <p className="text-lg italic text-stone-300">&ldquo;{quote.quote}&rdquo;</p>
            <p className="mt-2 text-amber-500 font-medium">— {quote.author}</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className={`${action.color} border border-amber-900/10 hover:border-amber-700/30 hover:shadow-lg hover:shadow-amber-900/5 transition-all cursor-pointer h-full`}>
                <CardContent className="p-4 text-center">
                  <action.icon className={`w-8 h-8 ${action.iconColor} mx-auto mb-2`} />
                  <p className="font-medium text-white text-sm">{action.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming Classes */}
      <Card className="border border-amber-900/15 bg-stone-900 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="w-5 h-5 text-amber-500" />
            Upcoming Live Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-stone-500">Loading...</p>
          ) : upcomingMeetings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-stone-700 mx-auto mb-2" />
              <p className="text-stone-500">No upcoming classes scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMeetings.map((meeting) => {
                const { date, time } = formatTime(meeting.scheduledAt);
                return (
                  <div
                    key={meeting.id}
                    className="flex items-center justify-between p-4 bg-stone-800/50 rounded-xl border border-amber-900/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-900/25 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-xs text-amber-400 font-medium">{date.split(" ")[0]}</span>
                        <span className="text-lg font-bold text-amber-300">{date.split(" ")[1]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{meeting.title}</p>
                        <p className="text-sm text-stone-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {time}
                        </p>
                      </div>
                    </div>
                    <a href={meeting.zoomLink} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white">
                        <Play className="w-4 h-4 mr-1" />
                        Join
                      </Button>
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
