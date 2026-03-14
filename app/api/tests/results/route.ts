import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - Fetch test results (admin/teacher only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin and teacher can view all results
    if (session.user.role !== "ADMIN" && session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const testId = searchParams.get("testId");

    if (testId) {
      // Get results for specific test
      const test = await prisma.mockTest.findUnique({
        where: { id: testId },
        include: {
          subject: { select: { name: true } },
          questions: { select: { id: true, marks: true } },
        },
      });

      if (!test) {
        return NextResponse.json({ error: "Test not found" }, { status: 404 });
      }

      const totalMarks = test.questions.reduce((sum, q) => sum + q.marks, 0);

      const attempts = await prisma.testAttempt.findMany({
        where: { testId },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: [
          { score: "desc" },
          { completedAt: "asc" },
        ],
      });

      // Calculate statistics
      const completedAttempts = attempts.filter(a => a.completed);
      const scores = completedAttempts.map(a => a.score);
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
      const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
      const passCount = scores.filter(s => (s / totalMarks) >= 0.4).length; // 40% pass

      const results = attempts.map((attempt, index) => ({
        rank: attempt.completed ? index + 1 : null,
        odcetId: attempt.id,
        studentId: attempt.userId,
        studentName: attempt.user.name,
        studentEmail: attempt.user.email,
        studentPhone: attempt.user.phone,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.totalMarks > 0 ? Math.round((attempt.score / attempt.totalMarks) * 100) : 0,
        status: attempt.completed ? "Completed" : "In Progress",
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        timeTaken: attempt.completedAt && attempt.startedAt 
          ? Math.round((new Date(attempt.completedAt).getTime() - new Date(attempt.startedAt).getTime()) / 60000)
          : null,
      }));

      return NextResponse.json({
        test: {
          id: test.id,
          title: test.title,
          subject: test.subject.name,
          totalMarks,
          totalQuestions: test.questions.length,
          duration: test.duration,
        },
        statistics: {
          totalAttempts: attempts.length,
          completedAttempts: completedAttempts.length,
          inProgress: attempts.length - completedAttempts.length,
          averageScore: Math.round(avgScore * 10) / 10,
          highestScore,
          lowestScore,
          passPercentage: completedAttempts.length > 0 
            ? Math.round((passCount / completedAttempts.length) * 100) 
            : 0,
        },
        results,
      });
    } else {
      // Get summary of all tests with attempt counts
      const tests = await prisma.mockTest.findMany({
        where: { active: true },
        include: {
          subject: { select: { name: true } },
          _count: { select: { attempts: true, questions: true } },
          attempts: {
            where: { completed: true },
            select: { score: true, totalMarks: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const summary = tests.map(test => {
        const scores = test.attempts.map(a => a.score);
        const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        
        return {
          id: test.id,
          title: test.title,
          subject: test.subject.name,
          totalQuestions: test._count.questions,
          totalAttempts: test._count.attempts,
          completedAttempts: test.attempts.length,
          averageScore: Math.round(avgScore * 10) / 10,
          averagePercentage: test.attempts.length > 0 && test.attempts[0]?.totalMarks > 0
            ? Math.round((avgScore / test.attempts[0].totalMarks) * 100)
            : 0,
        };
      });

      return NextResponse.json(summary);
    }
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
