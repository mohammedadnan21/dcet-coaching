"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Clock, Play, CheckCircle, Trophy } from "lucide-react";

interface Test {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  showRanking: boolean;
  subject: { id: string; name: string };
  _count: { questions: number };
}

export default function StudentTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mock Tests</h1>
        <p className="text-gray-600 mt-1">Practice with timed assessments</p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading tests...</div>
      ) : tests.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tests Available</h3>
            <p className="text-gray-600">Check back later for new assessments.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
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
    </div>
  );
}
