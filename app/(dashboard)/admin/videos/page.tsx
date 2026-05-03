"use client";

import { useState } from "react";
import { useCachedFetch } from "@/hooks/use-cached-fetch";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Video, Play } from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  createdAt: string;
  subject: { id: string; name: string };
  uploader: { id: string; name: string };
}

interface VideosListResponse {
  items: VideoItem[];
  total: number;
}

interface Subject {
  id: string;
  name: string;
}

export default function VideosPage() {
  const { data: videosData, loading, refetch: fetchVideos } = useCachedFetch<VideosListResponse>("/api/videos?limit=100");
  const { data: subjectsData } = useCachedFetch<Subject[]>("/api/subjects");
  const videos = videosData?.items ?? [];
  const subjects = subjectsData || [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtubeUrl: "",
    subjectId: "",
  });
  const [saving, setSaving] = useState(false);

  const getYoutubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const method = editingVideo ? "PUT" : "POST";
      const body = editingVideo ? { id: editingVideo.id, ...formData } : formData;

      const response = await fetch("/api/videos", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: editingVideo ? "Video updated" : "Video added",
        });
        setDialogOpen(false);
        setEditingVideo(null);
        setFormData({ title: "", description: "", youtubeUrl: "", subjectId: "" });
        fetchVideos();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save video",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      const response = await fetch(`/api/videos?id=${id}`, { method: "DELETE" });
      if (response.ok) {
        toast({ title: "Success", description: "Video deleted" });
        fetchVideos();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (video: VideoItem) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || "",
      youtubeUrl: video.youtubeUrl,
      subjectId: video.subject.id,
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingVideo(null);
    setFormData({ title: "", description: "", youtubeUrl: "", subjectId: "" });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 bg-stone-950 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Videos</h1>
          <p className="text-stone-400 mt-1">Manage course videos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingVideo ? "Edit Video" : "Add New Video"}</DialogTitle>
                <DialogDescription>
                  Add a YouTube video URL to share with students
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Video title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={formData.subjectId}
                    onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtubeUrl">YouTube URL</Label>
                  <Input
                    id="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the video..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingVideo ? "Update" : "Add Video"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-stone-500">Loading videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <Card className="border border-amber-900/15 bg-stone-900 shadow-md">
          <CardContent className="py-12 text-center">
            <Video className="w-16 h-16 text-stone-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Videos Yet</h3>
            <p className="text-stone-400 mb-4">Add your first video to get started.</p>
            <Button onClick={openNewDialog} className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Video
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => {
            const videoId = getYoutubeVideoId(video.youtubeUrl);
            return (
              <Card key={video.id} className="border border-amber-900/15 bg-stone-900 shadow-md overflow-hidden">
                <div className="relative aspect-video bg-stone-800/50">
                  {videoId ? (
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-12 h-12 text-stone-500" />
                    </div>
                  )}
                  <a
                    href={video.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </a>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white line-clamp-2">{video.title}</h3>
                    <div className="flex gap-1 ml-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(video)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleDelete(video.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-amber-500 mb-2">{video.subject.name}</p>
                  <p className="text-xs text-stone-500">
                    Added by {video.uploader.name} on {new Date(video.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
