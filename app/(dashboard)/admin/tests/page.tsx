"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, ClipboardList, Clock, Users, Trash2, Eye, EyeOff } from "lucide-react";

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
  description: string | null;
  duration: number;
  showRanking: boolean;
  active: boolean;
  subject: { id: string; name: string };
  creator: { id: string; name: string };
  _count: { questions: number; attempts: number };
}

interface Subject {
  id: string;
  name: string;
}

export default function TestsPage() {
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
    setQuestions([
      ...questions,
      { question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A", marks: 1 },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof MCQuestion, value: string | number) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate questions
    const invalidQ = questions.find(
      (q) => !q.question || !q.optionA || !q.optionB || !q.optionC || !q.optionD
    );
    if (invalidQ) {
      toast({
        title: "Error",
        description: "Please fill all question fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, questions }),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Test created successfully" });
        setDialogOpen(false);
        setFormData({ title: "", description: "", subjectId: "", duration: "30", showRanking: false });
        setQuestions([{ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A", marks: 1 }]);
        fetchTests();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create test",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleRanking = async (testId: string, showRanking: boolean) => {
    try {
      await fetch("/api/tests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: testId, showRanking }),
      });
      fetchTests();
      toast({ title: "Updated", description: showRanking ? "Rankings enabled" : "Rankings hidden" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this test? This action cannot be undone.")) return;

    try {
      await fetch(`/api/tests?id=${id}`, { method: "DELETE" });
      toast({ title: "Deleted", description: "Test deleted successfully" });
      fetchTests();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete test", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mock Tests</h1>
          <p className="text-gray-600 mt-1">Create and manage assessments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create Mock Test</DialogTitle>
                <DialogDescription>Create a new MCQ test for students</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Test Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Mathematics Unit Test 1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select
                      value={formData.subjectId}
                      onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      min="1"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      checked={formData.showRanking}
                      onCheckedChange={(checked) => setFormData({ ...formData, showRanking: checked })}
                    />
                    <Label>Show Rankings to Students</Label>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Questions ({questions.length})</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Question
                    </Button>
                  </div>

                  {questions.map((q, index) => (
                    <Card key={index} className="mb-4">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Question {index + 1}</Label>
                          {questions.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-500"
                              onClick={() => removeQuestion(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <Textarea
                          value={q.question}
                          onChange={(e) => updateQuestion(index, "question", e.target.value)}
                          placeholder="Enter the question..."
                          rows={2}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={q.optionA}
                            onChange={(e) => updateQuestion(index, "optionA", e.target.value)}
                            placeholder="Option A"
                          />
                          <Input
                            value={q.optionB}
                            onChange={(e) => updateQuestion(index, "optionB", e.target.value)}
                            placeholder="Option B"
                          />
                          <Input
                            value={q.optionC}
                            onChange={(e) => updateQuestion(index, "optionC", e.target.value)}
                            placeholder="Option C"
                          />
                          <Input
                            value={q.optionD}
                            onChange={(e) => updateQuestion(index, "optionD", e.target.value)}
                            placeholder="Option D"
                          />
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <Label className="text-xs">Correct Answer</Label>
                            <Select
                              value={q.correctOption}
                              onValueChange={(v) => updateQuestion(index, "correctOption", v)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A">Option A</SelectItem>
                                <SelectItem value="B">Option B</SelectItem>
                                <SelectItem value="C">Option C</SelectItem>
                                <SelectItem value="D">Option D</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="w-24">
                            <Label className="text-xs">Marks</Label>
                            <Input
                              type="number"
                              value={q.marks}
                              onChange={(e) => updateQuestion(index, "marks", parseInt(e.target.value) || 1)}
                              min="1"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Creating..." : "Create Test"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading tests...</p>
        </div>
      ) : tests.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tests Yet</h3>
            <p className="text-gray-600">Create your first mock test to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <Card key={test.id} className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{test.title}</CardTitle>
                    <p className="text-sm text-blue-600">{test.subject.name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500"
                    onClick={() => handleDelete(test.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {test.duration} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <ClipboardList className="w-4 h-4" />
                    {test._count.questions} Qs
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {test._count.attempts} attempts
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-gray-600">Show Rankings</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRanking(test.id, !test.showRanking)}
                  >
                    {test.showRanking ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
