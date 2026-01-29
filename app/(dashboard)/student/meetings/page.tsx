"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Play } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  zoomLink: string;
  scheduledAt: string;
  cancelled: boolean;
  host: { id: string; name: string };
}

export default function StudentMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch("/api/meetings?upcoming=true");
      const data = await response.json();
      setMeetings(data);
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const isHappeningNow = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMinutes = (date.getTime() - now.getTime()) / (1000 * 60);
    return diffMinutes <= 15 && diffMinutes >= -60; // 15 mins before to 60 mins after
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Live Classes</h1>
        <p className="text-gray-600 mt-1">Join upcoming Zoom sessions</p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading classes...</div>
      ) : meetings.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Upcoming Classes</h3>
            <p className="text-gray-600">Check back later for scheduled live sessions.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => {
            const { date, time } = formatDateTime(meeting.scheduledAt);
            const isNow = isHappeningNow(meeting.scheduledAt);

            return (
              <Card
                key={meeting.id}
                className={`border-0 shadow-md ${isNow ? "ring-2 ring-green-500 bg-green-50" : ""}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-xl flex flex-col items-center justify-center">
                        <Video className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-gray-900">{meeting.title}</h3>
                          {isNow && (
                            <Badge className="bg-green-500 text-white animate-pulse">
                              Live Now
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">Host: {meeting.host.name}</p>
                        {meeting.description && (
                          <p className="text-sm text-gray-600 mt-2">{meeting.description}</p>
                        )}
                      </div>
                    </div>
                    <a href={meeting.zoomLink} target="_blank" rel="noopener noreferrer">
                      <Button
                        className={isNow ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {isNow ? "Join Now" : "Join Class"}
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
