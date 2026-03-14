"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft, 
  Trophy, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  BarChart3
} from "lucide-react";
import Link from "next/link";

interface TestResult {
  rank: number | null;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  score: number;
  totalMarks: number;
  percentage: number;
  status: string;
  startedAt: string;
  completedAt: string | null;
  timeTaken: number | null;
}

interface TestData {
  test: {
    id: string;
    title: string;
    subject: string;
    totalMarks: number;
    totalQuestions: number;
    duration: number;
  };
  statistics: {
    totalAttempts: number;
    completedAttempts: number;
    inProgress: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    passPercentage: number;
  };
  results: TestResult[];
}

export default function TestResultsPage() {
  const searchParams = useSearchParams();
  const testId = searchParams.get("testId");
  
  const [data, setData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (testId) {
      fetchResults();
    }
  }, [testId]);

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/tests/results?testId=${testId}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch results:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data) return;
    
    const headers = ["Rank", "Name", "Email", "Phone", "Score", "Total", "Percentage", "Status", "Time (mins)"];
    const rows = data.results.map(r => [
      r.rank || "-",
      r.studentName,
      r.studentEmail,
      r.studentPhone,
      r.score,
      r.totalMarks,
      `${r.percentage}%`,
      r.status,
      r.timeTaken || "-"
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.test.title}-results.csv`;
    a.click();
  };

  if (!testId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/tests">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Test Results</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Please select a test to view results</p>
            <Link href="/admin/tests">
              <Button className="mt-4">Go to Tests</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/tests">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Loading Results...</h1>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/tests">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Results Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/tests">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{data.test.title}</h1>
            <p className="text-gray-600">
              {data.test.subject} • {data.test.totalQuestions} Questions • {data.test.totalMarks} Marks • {data.test.duration} mins
            </p>
          </div>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.statistics.totalAttempts}</p>
            <p className="text-xs text-gray-500">Total Attempts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.statistics.completedAttempts}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.statistics.averageScore}</p>
            <p className="text-xs text-gray-500">Avg Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.statistics.highestScore}</p>
            <p className="text-xs text-gray-500">Highest</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingDown className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.statistics.lowestScore}</p>
            <p className="text-xs text-gray-500">Lowest</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.statistics.passPercentage}%</p>
            <p className="text-xs text-gray-500">Pass Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Results</CardTitle>
        </CardHeader>
        <CardContent>
          {data.results.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No students have attempted this test yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Percentage</TableHead>
                    <TableHead className="text-center">Time</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.results.map((result, index) => (
                    <TableRow key={result.studentId + index}>
                      <TableCell>
                        {result.rank ? (
                          <div className="flex items-center gap-1">
                            {result.rank <= 3 && (
                              <Trophy className={`w-4 h-4 ${
                                result.rank === 1 ? "text-amber-500" :
                                result.rank === 2 ? "text-gray-400" :
                                "text-amber-700"
                              }`} />
                            )}
                            <span className="font-semibold">#{result.rank}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{result.studentName}</TableCell>
                      <TableCell className="text-sm text-gray-600">{result.studentEmail}</TableCell>
                      <TableCell className="text-sm text-gray-600">{result.studentPhone}</TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold">{result.score}</span>
                        <span className="text-gray-400">/{result.totalMarks}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={
                          result.percentage >= 80 ? "bg-green-100 text-green-800" :
                          result.percentage >= 60 ? "bg-blue-100 text-blue-800" :
                          result.percentage >= 40 ? "bg-amber-100 text-amber-800" :
                          "bg-red-100 text-red-800"
                        }>
                          {result.percentage}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {result.timeTaken ? (
                          <span className="flex items-center justify-center gap-1 text-sm">
                            <Clock className="w-3 h-3" />
                            {result.timeTaken} min
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={result.status === "Completed" ? "default" : "outline"}>
                          {result.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
