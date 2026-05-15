"use client";

import { useState } from "react";
import { useCachedFetch } from "@/hooks/use-cached-fetch";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Calendar, Clock, Video, XCircle, Trash2 } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  zoomLink: string;
  scheduledAt: string;
  cancelled: boolean;
  cancelReason: string | null;
  host: { id: string; name: string; role: string };
}

interface MeetingsListResponse {
  items: Meeting[];
  total: number;
}

export default function MeetingsPage() {
  const { data: meetingsData, loading, refetch: refetchMeetings } =
    useCachedFetch<MeetingsListResponse>("/api/meetings?limit=100");
  const meetings = meetingsData?.items ?? [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    zoomLink: "",
    scheduledAt: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchMeetings = () => refetchMeetings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Meeting scheduled" });
        setDialogOpen(false);
        setFormData({ title: "", description: "", zoomLink: "", scheduledAt: "" });
        fetchMeetings();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule meeting",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedMeeting) return;
    setSaving(true);

    try {
      const response = await fetch("/api/meetings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedMeeting.id,
          cancelled: true,
          cancelReason,
        }),
      });

      if (response.ok) {
        toast({ title: "Meeting Cancelled", description: "The meeting has been cancelled" });
        setCancelDialogOpen(false);
        setSelectedMeeting(null);
        setCancelReason("");
        fetchMeetings();
      } else {
        throw new Error("Failed to cancel meeting");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel meeting",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;

    try {
      const response = await fetch(`/api/meetings?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      toast({ title: "Success", description: "Meeting deleted" });
      fetchMeetings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete meeting",
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const isUpcoming = (dateStr: string) => new Date(dateStr) > new Date();

  return (
    <div className="space-y-6 bg-stone-950 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Meetings</h1>
          <p className="text-stone-400 mt-1">Schedule and manage Zoom meetings</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Schedule New Meeting</DialogTitle>
                <DialogDescription>Create a new Zoom meeting for students</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Meeting Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Mathematics Live Class"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zoomLink">Zoom Meeting Link</Label>
                  <Input
                    id="zoomLink"
                    value={formData.zoomLink}
                    onChange={(e) => setFormData({ ...formData, zoomLink: e.target.value })}
                    placeholder="https://zoom.us/j/..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">Schedule Date & Time</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What will be covered in this meeting..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Scheduling..." : "Schedule Meeting"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-stone-500">Loading meetings...</p>
        </div>
      ) : meetings.length === 0 ? (
        <Card className="border border-amber-900/15 bg-stone-900 shadow-md">
          <CardContent className="py-12 text-center">
            <Calendar className="w-16 h-16 text-stone-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Meetings</h3>
            <p className="text-stone-400 mb-4">Schedule your first meeting to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => {
            const { date, time } = formatDateTime(meeting.scheduledAt);
            const upcoming = isUpcoming(meeting.scheduledAt);

            return (
              <Card
                key={meeting.id}
                className={`border border-amber-900/15 bg-stone-900 shadow-md ${meeting.cancelled ? "opacity-60" : ""}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-amber-900/25 rounded-xl flex flex-col items-center justify-center">
                        <Calendar className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-white">{meeting.title}</h3>
                          {meeting.cancelled && (
                            <Badge className="bg-red-900/25 text-red-400">Cancelled</Badge>
                          )}
                          {!meeting.cancelled && upcoming && (
                            <Badge className="bg-green-900/25 text-green-400">Upcoming</Badge>
                          )}
                          {!meeting.cancelled && !upcoming && (
                            <Badge className="bg-stone-800/50 text-stone-400">Past</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-stone-400 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {time}
                          </span>
                        </div>
                        <p className="text-sm text-stone-500">Host: {meeting.host.name}</p>
                        {meeting.description && (
                          <p className="text-sm text-stone-400 mt-2">{meeting.description}</p>
                        )}
                        {meeting.cancelReason && (
                          <p className="text-sm text-red-600 mt-2">
                            Cancel reason: {meeting.cancelReason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!meeting.cancelled && upcoming && (
                        <>
                          <a href={meeting.zoomLink} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white">
                              <Video className="w-4 h-4 mr-1" />
                              Join
                            </Button>
                          </a>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 border-red-900/30 hover:bg-red-900/15"
                            onClick={() => {
                              setSelectedMeeting(meeting);
                              setCancelDialogOpen(true);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => handleDelete(meeting.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Meeting</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel "{selectedMeeting?.title}"?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="cancelReason">Reason (optional)</Label>
            <Textarea
              id="cancelReason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Why is this meeting being cancelled?"
              rows={3}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Meeting
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={saving}>
              {saving ? "Cancelling..." : "Cancel Meeting"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
