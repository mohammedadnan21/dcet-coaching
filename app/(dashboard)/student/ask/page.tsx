"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, Send, User, Globe, Lock, Trash2 } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
}

interface Answer {
  id: string;
  content: string;
  createdAt: string;
  answerer: { id: string; name: string; role: string };
}

interface Question {
  id: string;
  content: string;
  visibility: string;
  createdAt: string;
  askedBy: { id: string; name: string };
  target: { id: string; name: string } | null;
  answers: Answer[];
}

export default function StudentAskPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [newQuestion, setNewQuestion] = useState("");
  const [visibility, setVisibility] = useState<string>("PUBLIC");
  const [targetId, setTargetId] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [questionsRes, usersRes] = await Promise.all([
        fetch("/api/questions"),
        fetch("/api/admin/users?role=TEACHER&status=APPROVED"),
      ]);

      const questionsData = await questionsRes.json();
      setQuestions(questionsData);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setTeachers(usersData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setSubmitting(true);

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newQuestion,
          visibility,
          targetId: visibility !== "PUBLIC" ? targetId : null,
        }),
      });

      if (response.ok) {
        toast({ title: "Question Posted", description: "Your question has been submitted" });
        setNewQuestion("");
        setVisibility("PUBLIC");
        setTargetId("");
        fetchData();
      } else {
        throw new Error("Failed to post question");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to post question", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;

    try {
      await fetch(`/api/questions?id=${id}`, { method: "DELETE" });
      toast({ title: "Deleted" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ask a Question</h1>
        <p className="text-gray-600 mt-1">Get help from teachers and the community</p>
      </div>

      {/* New Question Form */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Post a New Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Your Question</Label>
              <Textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ask anything about DCET, subjects, or concepts..."
                rows={4}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Public - Everyone can see
                      </div>
                    </SelectItem>
                    <SelectItem value="PRIVATE_ADMIN">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Private to Admin Only
                      </div>
                    </SelectItem>
                    <SelectItem value="PRIVATE_TEACHER">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Private to Specific Teacher
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {visibility === "PRIVATE_TEACHER" && (
                <div className="space-y-2">
                  <Label>Select Teacher</Label>
                  <Select value={targetId} onValueChange={setTargetId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" />
              {submitting ? "Posting..." : "Post Question"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* My Questions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">My Questions</h2>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : questions.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="py-12 text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">You haven't asked any questions yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <Card key={question.id} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {question.visibility === "PUBLIC" ? (
                        <Badge className="bg-green-100 text-green-700">
                          <Globe className="w-3 h-3 mr-1" />Public
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700">
                          <Lock className="w-3 h-3 mr-1" />Private
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => handleDelete(question.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <p className="text-gray-800 mb-4">{question.content}</p>

                  {/* Answers */}
                  {question.answers.length > 0 && (
                    <div className="border-t pt-4 space-y-3">
                      <p className="text-sm font-medium text-gray-700">
                        {question.answers.length} Answer{question.answers.length > 1 ? "s" : ""}
                      </p>
                      {question.answers.map((answer) => (
                        <div key={answer.id} className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-medium">{answer.answerer.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {answer.answerer.role}
                            </Badge>
                          </div>
                          <p className="text-gray-700">{answer.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.answers.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      Waiting for a response...
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
