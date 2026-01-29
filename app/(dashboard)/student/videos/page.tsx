"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Video, Play, Filter } from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  createdAt: string;
  subject: { id: string; name: string };
}

interface Subject {
  id: string;
  name: string;
}

export default function StudentVideosPage() {
  const searchParams = useSearchParams();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>(searchParams.get("subject") || "");
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects");
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    }
  };

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const url = selectedSubject
        ? `/api/videos?subjectId=${selectedSubject}`
        : "/api/videos";
      const response = await fetch(url);
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getYoutubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = getYoutubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Videos</h1>
          <p className="text-gray-600 mt-1">Watch recorded lectures</p>
        </div>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Video Player */}
      {selectedVideo && (
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="aspect-video">
            <iframe
              src={getYoutubeEmbedUrl(selectedVideo.youtubeUrl) || ""}
              title={selectedVideo.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold text-gray-900">{selectedVideo.title}</h2>
            <p className="text-blue-600 text-sm">{selectedVideo.subject.name}</p>
            {selectedVideo.description && (
              <p className="text-gray-600 mt-2">{selectedVideo.description}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Video Grid */}
      {loading ? (
        <div className="text-center py-12">Loading videos...</div>
      ) : videos.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Videos Yet</h3>
            <p className="text-gray-600">Videos will appear here once uploaded.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => {
            const videoId = getYoutubeVideoId(video.youtubeUrl);
            const isSelected = selectedVideo?.id === video.id;

            return (
              <Card
                key={video.id}
                className={`border-0 shadow-md overflow-hidden cursor-pointer transition-all ${
                  isSelected ? "ring-2 ring-blue-500" : "hover:shadow-lg"
                }`}
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative aspect-video bg-gray-100">
                  {videoId ? (
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-blue-600 mt-1">{video.subject.name}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
