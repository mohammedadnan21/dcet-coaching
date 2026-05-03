"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, Send, User, Trash2, Globe, Lock } from "lucide-react";

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
  target: { id: string; name: string; role: string } | null;
  answers: Answer[];
}

interface QuestionsListResponse {
  items: Question[];
  total: number;
  page: number;
  limit: number;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [answerInputs, setAnswerInputs] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("limit", "20");
        const response = await fetch(`/api/questions?${params}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data: QuestionsListResponse = await response.json();
        setQuestions(data.items);
        setTotalQuestions(data.total);
        setPage(1);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("limit", "20");
      const response = await fetch(`/api/questions?${params}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data: QuestionsListResponse = await response.json();
      setQuestions(data.items);
      setTotalQuestions(data.total);
      setPage(1);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreQuestions = async () => {
    const nextPage = page + 1;
    try {
      const params = new URLSearchParams();
      params.set("page", String(nextPage));
      params.set("limit", "20");
      const response = await fetch(`/api/questions?${params}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data: QuestionsListResponse = await response.json();
      setQuestions((prev) => [...prev, ...data.items]);
      setTotalQuestions(data.total);
      setPage(nextPage);
    } catch (error) {
      console.error("Failed to load more questions:", error);
    }
  };

  const handleAnswer = async (questionId: string) => {
    const content = answerInputs[questionId]?.trim();
    if (!content) return;

    setSubmitting(questionId);

    try {
      const response = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, content }),
      });

      if (response.ok) {
        toast({ title: "Answer Posted", description: "Your answer has been submitted" });
        setAnswerInputs({ ...answerInputs, [questionId]: "" });
        fetchQuestions();
      } else {
        throw new Error("Failed to post answer");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post answer",
        variant: "destructive",
      });
    } finally {
      setSubmitting(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;

    try {
      const response = await fetch(`/api/questions?id=${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Request failed");
      }
      toast({ title: "Deleted", description: "Question deleted" });
      fetchQuestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    if (visibility === "PUBLIC") {
      return <Badge className="bg-green-900/25 text-green-400"><Globe className="w-3 h-3 mr-1" />Public</Badge>;
    }
    return <Badge className="bg-amber-900/25 text-amber-400"><Lock className="w-3 h-3 mr-1" />Private</Badge>;
  };

  return (
    <div className="space-y-6 bg-stone-950 min-h-full">
      <div>
        <h1 className="text-3xl font-bold text-white">Q&A Forum</h1>
        <p className="text-stone-400 mt-1">View and answer student questions</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-stone-500">Loading questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <Card className="border border-amber-900/15 bg-stone-900 shadow-md">
          <CardContent className="py-12 text-center">
            <MessageCircle className="w-16 h-16 text-stone-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Questions Yet</h3>
            <p className="text-stone-400">Students haven't asked any questions yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <Card key={question.id} className="border border-amber-900/15 bg-stone-900 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-900/25 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{question.askedBy.name}</p>
                      <p className="text-xs text-stone-500">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getVisibilityBadge(question.visibility)}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => handleDelete(question.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-stone-400">{question.content}</p>

                {question.target && (
                  <p className="text-sm text-stone-500">
                    Directed to: <span className="font-medium">{question.target.name}</span>
                  </p>
                )}

                {/* Answers */}
                {question.answers.length > 0 && (
                  <div className="border-t border-amber-900/20 pt-4 space-y-3">
                    <p className="text-sm font-medium text-amber-400">
                      {question.answers.length} Answer{question.answers.length > 1 ? "s" : ""}
                    </p>
                    {question.answers.map((answer) => (
                      <div key={answer.id} className="bg-stone-800/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm text-white">{answer.answerer.name}</span>
                          <Badge className="text-xs" variant="outline">
                            {answer.answerer.role}
                          </Badge>
                          <span className="text-xs text-stone-500">
                            {new Date(answer.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-stone-400 text-sm">{answer.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Answer Input */}
                <div className="flex gap-2 pt-2">
                  <Textarea
                    value={answerInputs[question.id] || ""}
                    onChange={(e) =>
                      setAnswerInputs({ ...answerInputs, [question.id]: e.target.value })
                    }
                    placeholder="Write your answer..."
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleAnswer(question.id)}
                    disabled={submitting === question.id || !answerInputs[question.id]?.trim()}
                    className="self-end bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!loading && questions.length < totalQuestions && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={loadMoreQuestions}>
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
