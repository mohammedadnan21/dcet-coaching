"use client";

// Reuse admin tests page functionality
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, ClipboardList, Clock, Users, Trash2 } from "lucide-react";

interface MCQuestion {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  marks: number;
}

interface Test {
  id: string;
  title: string;
  duration: number;
  showRanking: boolean;
  subject: { id: string; name: string };
  _count: { questions: number; attempts: number };
}

interface Subject {
  id: string;
  name: string;
}

export default function TeacherTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subjectId: "",
    duration: "30",
    showRanking: false,
  });
  const [questions, setQuestions] = useState<MCQuestion[]>([
    { question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A", marks: 1 },
  ]);

  useEffect(() => {
    fetchTests();
    fetchSubjects();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch("/api/tests");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setTests(data);
    } catch (error) {
      console.error("Failed to fetch tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects");
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A", marks: 1 }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof MCQuestion, value: string | number) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, questions }),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Test created" });
        setDialogOpen(false);
        fetchTests();
      } else {
        throw new Error("Failed to create test");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Mock Tests</h1>
          <p className="text-stone-400 mt-1">Create assessments for students</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white">
              <Plus className="w-4 h-4 mr-2" />Create Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create Mock Test</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select value={formData.subjectId} onValueChange={(v) => setFormData({ ...formData, subjectId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration (mins)</Label>
                    <Input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} required />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch checked={formData.showRanking} onCheckedChange={(c) => setFormData({ ...formData, showRanking: c })} />
                    <Label>Show Rankings</Label>
                  </div>
                </div>
                <div className="border-t border-amber-900/20 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">Questions ({questions.length})</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                      <Plus className="w-4 h-4 mr-1" />Add
                    </Button>
                  </div>
                  {questions.map((q, index) => (
                    <Card key={index} className="mb-4 border border-amber-900/15 bg-stone-900 shadow-md">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between">
                          <Label>Question {index + 1}</Label>
                          {questions.length > 1 && (
                            <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => removeQuestion(index)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <Textarea value={q.question} onChange={(e) => updateQuestion(index, "question", e.target.value)} placeholder="Question..." rows={2} />
                        <div className="grid grid-cols-2 gap-2">
                          <Input value={q.optionA} onChange={(e) => updateQuestion(index, "optionA", e.target.value)} placeholder="Option A" />
                          <Input value={q.optionB} onChange={(e) => updateQuestion(index, "optionB", e.target.value)} placeholder="Option B" />
                          <Input value={q.optionC} onChange={(e) => updateQuestion(index, "optionC", e.target.value)} placeholder="Option C" />
                          <Input value={q.optionD} onChange={(e) => updateQuestion(index, "optionD", e.target.value)} placeholder="Option D" />
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <Label className="text-xs">Correct</Label>
                            <Select value={q.correctOption} onValueChange={(v) => updateQuestion(index, "correctOption", v)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A">A</SelectItem>
                                <SelectItem value="B">B</SelectItem>
                                <SelectItem value="C">C</SelectItem>
                                <SelectItem value="D">D</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="w-20">
                            <Label className="text-xs">Marks</Label>
                            <Input type="number" value={q.marks} onChange={(e) => updateQuestion(index, "marks", parseInt(e.target.value) || 1)} min="1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-400">Loading...</div>
      ) : tests.length === 0 ? (
        <Card className="border border-amber-900/15 bg-stone-900 shadow-md">
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-16 h-16 text-stone-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">No Tests</h3>
            <p className="text-stone-400">Create your first test.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <Card key={test.id} className="border border-amber-900/15 bg-stone-900 shadow-md">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-1 text-white">{test.title}</h3>
                <p className="text-sm text-amber-500 mb-3">{test.subject.name}</p>
                <div className="flex gap-4 text-sm text-stone-500">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{test.duration} mins</span>
                  <span className="flex items-center gap-1"><ClipboardList className="w-4 h-4" />{test._count.questions} Qs</span>
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" />{test._count.attempts}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
