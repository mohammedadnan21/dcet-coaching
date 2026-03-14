"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Clock, Play, CheckCircle, Trophy, BarChart3, RotateCcw } from "lucide-react";

interface Test {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  showRanking: boolean;
  subject: { id: string; name: string };
  _count: { questions: number };
}

interface MyAttempt {
  id: string;
  testId: string;
  testTitle: string;
  subject: string;
  score: number;
  totalMarks: number;
  percentage: number;
  completed: boolean;
  completedAt: string | null;
}

export default function StudentTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [myAttempts, setMyAttempts] = useState<MyAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("available");

  useEffect(() => {
    fetchTests();
    fetchMyAttempts();
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

  const fetchMyAttempts = async () => {
    try {
      const response = await fetch("/api/tests/my-attempts");
      if (response.ok) {
        const data = await response.json();
        setMyAttempts(data);
      }
    } catch (error) {
      console.error("Failed to fetch attempts:", error);
    }
  };

  // Get IDs of tests student has already completed
  const completedTestIds = myAttempts.filter(a => a.completed).map(a => a.testId);
  const availableTests = tests.filter(t => !completedTestIds.includes(t.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mock Tests</h1>
        <p className="text-gray-600 mt-1">Practice with timed assessments and track your progress</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="available" className="gap-2">
            <Play className="w-4 h-4" />
            Available Tests ({availableTests.length})
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            My Results ({myAttempts.filter(a => a.completed).length})
          </TabsTrigger>
        </TabsList>

        {/* Available Tests Tab */}
        <TabsContent value="available" className="mt-6">
          {loading ? (
            <div className="text-center py-12">Loading tests...</div>
          ) : availableTests.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">All Tests Completed!</h3>
                <p className="text-gray-600">You have completed all available tests. Check your results tab.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableTests.map((test) => (
                <Card key={test.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <ClipboardList className="w-6 h-6 text-purple-600" />
                      </div>
                      {test.showRanking && (
                        <Badge className="bg-amber-100 text-amber-700">
                          <Trophy className="w-3 h-3 mr-1" />
                          Ranked
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{test.title}</h3>
                    <p className="text-sm text-blue-600 mb-3">{test.subject.name}</p>
                    {test.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{test.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {test.duration} mins
                      </span>
                      <span className="flex items-center gap-1">
                        <ClipboardList className="w-4 h-4" />
                        {test._count.questions} questions
                      </span>
                    </div>
                    <Link href={`/student/tests/${test.id}`}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <Play className="w-4 h-4 mr-2" />
                        Start Test
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Results Tab */}
        <TabsContent value="results" className="mt-6">
          {myAttempts.filter(a => a.completed).length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tests Taken Yet</h3>
                <p className="text-gray-600">Complete a test to see your results here.</p>
                <Button 
                  className="mt-4"
                  onClick={() => setActiveTab("available")}
                >
                  View Available Tests
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myAttempts.filter(a => a.completed).map((attempt) => (
                <Card key={attempt.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      {/* Score Circle */}
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                        attempt.percentage >= 80 ? "bg-green-500" :
                        attempt.percentage >= 60 ? "bg-blue-500" :
                        attempt.percentage >= 40 ? "bg-amber-500" :
                        "bg-red-500"
                      }`}>
                        {attempt.percentage}%
                      </div>
                      <Badge className={
                        attempt.percentage >= 80 ? "bg-green-100 text-green-700" :
                        attempt.percentage >= 60 ? "bg-blue-100 text-blue-700" :
                        attempt.percentage >= 40 ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }>
                        {attempt.percentage >= 40 ? "Passed" : "Failed"}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{attempt.testTitle}</h3>
                    <p className="text-sm text-blue-600 mb-3">{attempt.subject}</p>
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Score:</span>
                        <span className="font-bold text-gray-900">{attempt.score} / {attempt.totalMarks}</span>
                      </div>
                      {attempt.completedAt && (
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-600">Date:</span>
                          <span className="text-gray-900">
                            {new Date(attempt.completedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/student/tests/${attempt.testId}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Retake
                        </Button>
                      </Link>
                      <Link href="/student/rankings" className="flex-1">
                        <Button className="w-full bg-amber-500 hover:bg-amber-600" size="sm">
                          <Trophy className="w-4 h-4 mr-1" />
                          Rankings
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
