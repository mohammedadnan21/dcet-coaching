"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, Send, User, Globe, Lock } from "lucide-react";

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

export default function TeacherQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerInputs, setAnswerInputs] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/questions");
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
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
        toast({ title: "Answer Posted" });
        setAnswerInputs({ ...answerInputs, [questionId]: "" });
        fetchQuestions();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to post answer", variant: "destructive" });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Questions</h1>
        <p className="text-gray-600 mt-1">View and answer student questions</p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : questions.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Questions</h3>
            <p className="text-gray-600">No student questions yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <Card key={question.id} className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{question.askedBy.name}</p>
                    <p className="text-xs text-gray-500">{new Date(question.createdAt).toLocaleDateString()}</p>
                  </div>
                  {question.visibility === "PUBLIC" ? (
                    <Badge className="bg-green-100 text-green-700 ml-auto"><Globe className="w-3 h-3 mr-1" />Public</Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 ml-auto"><Lock className="w-3 h-3 mr-1" />Private</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-800">{question.content}</p>

                {question.answers.length > 0 && (
                  <div className="border-t pt-4 space-y-3">
                    {question.answers.map((answer) => (
                      <div key={answer.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">{answer.answerer.name}</span>
                          <Badge variant="outline" className="text-xs">{answer.answerer.role}</Badge>
                        </div>
                        <p className="text-gray-700 text-sm">{answer.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Textarea
                    value={answerInputs[question.id] || ""}
                    onChange={(e) => setAnswerInputs({ ...answerInputs, [question.id]: e.target.value })}
                    placeholder="Write your answer..."
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleAnswer(question.id)}
                    disabled={submitting === question.id || !answerInputs[question.id]?.trim()}
                    className="self-end"
                  >
                    <Send className="w-4 h-4" />
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
