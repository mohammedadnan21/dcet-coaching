"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Edit, Trash2, BookOpen, Video, ClipboardList } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  _count: {
    videos: number;
    mockTests: number;
  };
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingSubject ? "/api/subjects" : "/api/subjects";
      const method = editingSubject ? "PUT" : "POST";
      const body = editingSubject
        ? { id: editingSubject.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: editingSubject ? "Subject updated" : "Subject created",
        });
        setDialogOpen(false);
        setEditingSubject(null);
        setFormData({ name: "", description: "" });
        fetchSubjects();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save subject",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;

    try {
      const response = await fetch(`/api/subjects?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({ title: "Success", description: "Subject deleted" });
        fetchSubjects();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({ name: subject.name, description: subject.description || "" });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingSubject(null);
    setFormData({ name: "", description: "" });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 bg-stone-950 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Subjects</h1>
          <p className="text-stone-400 mt-1">Manage course subjects</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingSubject ? "Edit Subject" : "Add New Subject"}
                </DialogTitle>
                <DialogDescription>
                  {editingSubject
                    ? "Update the subject details"
                    : "Create a new subject for your courses"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Subject Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Mathematics"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the subject..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingSubject ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-stone-500">Loading subjects...</p>
        </div>
      ) : subjects.length === 0 ? (
        <Card className="border border-amber-900/15 bg-stone-900 shadow-md">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-16 h-16 text-stone-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Subjects Yet</h3>
            <p className="text-stone-400 mb-4">Create your first subject to get started.</p>
            <Button onClick={openNewDialog} className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card key={subject.id} className="border border-amber-900/15 bg-stone-900 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-900/25 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-amber-500" />
                    </div>
                    <CardTitle className="text-lg text-white">{subject.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(subject)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(subject.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-stone-400 text-sm mb-4">
                  {subject.description || "No description"}
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1 text-sm text-stone-500">
                    <Video className="w-4 h-4" />
                    <span>{subject._count.videos} videos</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-stone-500">
                    <ClipboardList className="w-4 h-4" />
                    <span>{subject._count.mockTests} tests</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
