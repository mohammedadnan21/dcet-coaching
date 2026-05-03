"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, Medal, Award } from "lucide-react";

interface Test {
  id: string;
  title: string;
  showRanking: boolean;
  subject: { name: string };
}

interface RankingEntry {
  rank: number;
  userName: string;
  score: number;
  totalMarks: number;
  percentage: number;
  isCurrentUser: boolean;
}

export default function StudentRankingsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>("");
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [testTitle, setTestTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadingRankings, setLoadingRankings] = useState(false);

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      fetchRankings(selectedTest);
    }
  }, [selectedTest]);

  const fetchTests = async () => {
    try {
      const response = await fetch("/api/tests");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      const rankedTests = data.filter((t: Test) => t.showRanking);
      setTests(rankedTests);
      if (rankedTests.length > 0) {
        setSelectedTest(rankedTests[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRankings = async (testId: string) => {
    setLoadingRankings(true);
    try {
      const response = await fetch(`/api/tests/rankings?testId=${testId}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setRankings(data.rankings);
      setTestTitle(data.testTitle);
    } catch (error) {
      console.error("Failed to fetch rankings:", error);
      setRankings([]);
    } finally {
      setLoadingRankings(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1)
      return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2)
      return <Medal className="w-6 h-6 text-stone-400" />;
    if (rank === 3)
      return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-stone-500 font-bold">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-amber-900/40 to-amber-800/20 border-amber-700/40";
    if (rank === 2) return "bg-stone-800/50 border-stone-600";
    if (rank === 3) return "bg-gradient-to-r from-amber-900/30 to-orange-950/30 border-amber-700/35";
    return "bg-stone-900 border border-amber-900/15";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-stone-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Rankings</h1>
          <p className="text-stone-400 mt-1">See how you compare with other students</p>
        </div>
        {tests.length > 0 && (
          <Select value={selectedTest} onValueChange={setSelectedTest}>
            <SelectTrigger className="w-[250px] border-amber-900/20 bg-stone-900 text-white">
              <SelectValue placeholder="Select a test" />
            </SelectTrigger>
            <SelectContent>
              {tests.map((test) => (
                <SelectItem key={test.id} value={test.id}>
                  {test.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {tests.length === 0 ? (
        <Card className="border border-amber-900/15 bg-stone-900 shadow-md">
          <CardContent className="py-12 text-center">
            <Trophy className="w-16 h-16 text-stone-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Rankings Available</h3>
            <p className="text-stone-400">
              Rankings will appear once you take tests with ranking enabled.
            </p>
          </CardContent>
        </Card>
      ) : loadingRankings ? (
        <div className="text-center py-12 text-stone-400">Loading rankings...</div>
      ) : rankings.length === 0 ? (
        <Card className="border border-amber-900/15 bg-stone-900 shadow-md">
          <CardContent className="py-12 text-center">
            <Trophy className="w-16 h-16 text-stone-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Rankings Yet</h3>
            <p className="text-stone-400">Be the first to complete this test!</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-amber-900/15 bg-stone-900 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Trophy className="w-5 h-5 text-amber-400" />
              {testTitle} - Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankings.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-4 rounded-xl border ${getRankBg(
                    entry.rank
                  )} ${entry.isCurrentUser ? "ring-2 ring-amber-500" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div>
                      <p className="font-semibold text-white flex items-center gap-2">
                        {entry.userName}
                        {entry.isCurrentUser && (
                          <Badge className="bg-amber-900/30 text-amber-400 border border-amber-700/30">You</Badge>
                        )}
                      </p>
                      <p className="text-sm text-stone-500">
                        Score: {entry.score}/{entry.totalMarks}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{entry.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
