"use client";

import { useState, useEffect } from "react";
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
import { Plus, Calendar, Clock, Video, XCircle } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  zoomLink: string;
  scheduledAt: string;
  cancelled: boolean;
  cancelReason: string | null;
  host: { id: string; name: string };
}

export default function TeacherMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    zoomLink: "",
    scheduledAt: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch("/api/meetings");
      const data = await response.json();
      setMeetings(data);
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
    } finally {
      setLoading(false);
    }
  };

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
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this meeting?")) return;

    try {
      await fetch("/api/meetings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, cancelled: true }),
      });
      toast({ title: "Cancelled", description: "Meeting cancelled" });
      fetchMeetings();
    } catch (error) {
      toast({ title: "Error", description: "Failed to cancel", variant: "destructive" });
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const isUpcoming = (dateStr: string) => new Date(dateStr) > new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600 mt-1">Schedule and manage live classes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Schedule New Meeting</DialogTitle>
                <DialogDescription>Create a Zoom meeting for students</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Meeting Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Mathematics Live Class"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zoom Meeting Link</Label>
                  <Input
                    value={formData.zoomLink}
                    onChange={(e) => setFormData({ ...formData, zoomLink: e.target.value })}
                    placeholder="https://zoom.us/j/..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Schedule Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What will be covered..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Scheduling..." : "Schedule"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : meetings.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Meetings</h3>
            <p className="text-gray-600">Schedule your first meeting.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => {
            const { date, time } = formatDateTime(meeting.scheduledAt);
            const upcoming = isUpcoming(meeting.scheduledAt);

            return (
              <Card key={meeting.id} className={`border-0 shadow-md ${meeting.cancelled ? "opacity-60" : ""}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{meeting.title}</h3>
                          {meeting.cancelled && <Badge className="bg-red-100 text-red-700">Cancelled</Badge>}
                          {!meeting.cancelled && upcoming && <Badge className="bg-green-100 text-green-700">Upcoming</Badge>}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{time}</span>
                        </div>
                      </div>
                    </div>
                    {!meeting.cancelled && upcoming && (
                      <div className="flex gap-2">
                        <a href={meeting.zoomLink} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Video className="w-4 h-4 mr-1" />Join
                          </Button>
                        </a>
                        <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleCancel(meeting.id)}>
                          <XCircle className="w-4 h-4 mr-1" />Cancel
                        </Button>
                      </div>
                    )}
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
