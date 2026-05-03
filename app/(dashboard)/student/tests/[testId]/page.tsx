"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight } from "lucide-react";

interface Question {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  marks: number;
}

interface SavedAnswer {
  questionId: string;
  selectedOption: string | null;
}

interface TestData {
  attemptId: string;
  testId: string;
  title: string;
  duration: number;
  startedAt: string;
  questions: Question[];
  savedAnswers: SavedAnswer[];
}

interface Result {
  questionId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  selectedOption: string | null;
  isCorrect: boolean;
  marks: number;
}

export default function TakeTestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string;

  const [testData, setTestData] = useState<TestData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    totalMarks: number;
    percentage: number;
    results: Result[];
  } | null>(null);

  const autoSubmitRef = useRef(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    startTest();
  }, [testId]);

  const autoSubmit = useCallback(async () => {
    if (autoSubmitRef.current || submittingRef.current) return;
    autoSubmitRef.current = true;
    submittingRef.current = true;
    setSubmitting(true);

    try {
      const currentTestData = testData;
      if (!currentTestData) return;

      const response = await fetch("/api/tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: currentTestData.attemptId }),
      });

      const data = await response.json();
      if (response.ok) {
        setResults(data);
        setSubmitted(true);
        toast({ title: "Time's Up!", description: `Test auto-submitted. You scored ${data.score}/${data.totalMarks}` });
      }
    } catch {
      toast({ title: "Error", description: "Failed to auto-submit test", variant: "destructive" });
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  }, [testData]);

  useEffect(() => {
    if (timeLeft <= 0 || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          autoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted, autoSubmit]);

  const startTest = async () => {
    try {
      const response = await fetch("/api/tests/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.attempt?.completed) {
          toast({ title: "Already Completed", description: "You have already taken this test" });
          router.push("/student/tests");
          return;
        }
        throw new Error(data.error);
      }

      setTestData(data);

      // Set saved answers
      const savedAnswersMap: { [key: string]: string } = {};
      data.savedAnswers.forEach((sa: SavedAnswer) => {
        if (sa.selectedOption) {
          savedAnswersMap[sa.questionId] = sa.selectedOption;
        }
      });
      setAnswers(savedAnswersMap);

      // Calculate remaining time
      const startTime = new Date(data.startedAt).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, data.duration * 60 - elapsed);
      setTimeLeft(remaining);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      router.push("/student/tests");
    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = async (questionId: string, option: string) => {
    if (!testData) return;

    setAnswers((prev) => ({ ...prev, [questionId]: option }));

    try {
      const response = await fetch("/api/tests/attempt", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: testData.attemptId,
          questionId,
          selectedOption: option,
        }),
      });

      if (!response.ok) {
        toast({ title: "Warning", description: "Failed to save answer to server. It will retry on submit.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Warning", description: "Network error saving answer. Check your connection.", variant: "destructive" });
    }
  };

  const handleSubmit = async () => {
    if (!testData || submitting) return;

    if (!confirm("Are you sure you want to submit? You cannot change answers after submission.")) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: testData.attemptId }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
        setSubmitted(true);
        toast({ title: "Test Submitted!", description: `You scored ${data.score}/${data.totalMarks}` });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-stone-500">Loading test...</p>
      </div>
    );
  }

  if (submitted && results) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Card className="border border-amber-900/15 bg-stone-900 shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center mb-4">
                <span className="text-4xl font-bold text-white">{results.percentage}%</span>
              </div>
              <p className="text-2xl font-bold text-white mb-2">
                {results.score} / {results.totalMarks}
              </p>
              <p className="text-stone-400">
                {results.percentage >= 80
                  ? "Excellent! Keep it up!"
                  : results.percentage >= 60
                  ? "Good job! Room for improvement."
                  : "Keep practicing, you'll get better!"}
              </p>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold text-white">Review Answers</h2>
        {results.results.map((r, index) => (
          <Card key={r.questionId} className="border border-amber-900/15 bg-stone-900 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    r.isCorrect ? "bg-green-900/25" : "bg-red-900/25"
                  }`}
                >
                  {r.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white mb-3">
                    Q{index + 1}. {r.question}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {["A", "B", "C", "D"].map((opt) => {
                      const optionKey = `option${opt}` as keyof Result;
                      const isCorrect = r.correctOption === opt;
                      const isSelected = r.selectedOption === opt;

                      return (
                        <div
                          key={opt}
                          className={`p-3 rounded-lg border ${
                            isCorrect
                              ? "bg-green-900/15 border-green-300"
                              : isSelected && !isCorrect
                              ? "bg-red-900/15 border-red-300"
                              : "bg-stone-800/50 border-stone-700"
                          }`}
                        >
                          <span className="font-medium mr-2">{opt}.</span>
                          {r[optionKey] as string}
                          {isCorrect && <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />}
                          {isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-red-600 inline ml-2" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex gap-4">
          <Button onClick={() => router.push("/student/tests")} variant="outline" className="flex-1">
            Back to Tests
          </Button>
          <Button
            onClick={() => router.push("/student/rankings")}
            className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white"
          >
            View Rankings
          </Button>
        </div>
      </div>
    );
  }

  if (!testData) return null;

  const question = testData.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900 border border-amber-900/15 p-4 rounded-xl shadow-md sticky top-4 z-10">
        <div>
          <h1 className="font-bold text-base sm:text-lg text-white">{testData.title}</h1>
          <p className="text-sm text-stone-500">
            Question {currentQuestion + 1} of {testData.questions.length}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Badge className={`${timeLeft < 60 ? "bg-red-500" : "bg-amber-600"} text-white`}>
            <Clock className="w-4 h-4 mr-1" />
            {formatTime(timeLeft)}
          </Badge>
          <Badge variant="outline">
            {answeredCount}/{testData.questions.length} answered
          </Badge>
        </div>
      </div>

      {/* Question */}
      <Card className="border border-amber-900/15 bg-stone-900 shadow-md">
        <CardContent className="p-6">
          <div className="mb-6">
            <Badge className="mb-4">{question.marks} mark{question.marks > 1 ? "s" : ""}</Badge>
            <p className="text-lg font-medium text-white">{question.question}</p>
          </div>

          <div className="space-y-3">
            {["A", "B", "C", "D"].map((opt) => {
              const optionKey = `option${opt}` as keyof Question;
              const isSelected = answers[question.id] === opt;

              return (
                <button
                  key={opt}
                  onClick={() => saveAnswer(question.id, opt)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all text-stone-300 ${
                    isSelected
                      ? "border-amber-500 bg-amber-900/15 text-white"
                      : "border-stone-700 hover:border-amber-700/40 hover:bg-amber-900/15"
                  }`}
                >
                  <span className="font-medium mr-3">{opt}.</span>
                  {question[optionKey] as string}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Question Numbers */}
      <div className="flex gap-2 flex-wrap justify-center">
        {testData.questions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestion(index)}
            className={`w-8 h-8 rounded-lg text-sm font-medium ${
              index === currentQuestion
                ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white"
                : answers[testData.questions[index].id]
                ? "bg-green-900/25 text-green-400"
                : "bg-stone-800/50 text-stone-400"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          variant="outline"
          className="flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {currentQuestion === testData.questions.length - 1 ? (
          <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700 flex-shrink-0">
            {submitting ? "Submitting..." : "Submit Test"}
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestion((prev) => Math.min(testData.questions.length - 1, prev + 1))}
            className="flex-shrink-0"
          >
            <span className="hidden sm:inline">Next</span>
            <ArrowRight className="w-4 h-4 sm:ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
