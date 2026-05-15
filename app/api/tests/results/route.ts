import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function parsePageLimit(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const rawLimit = parseInt(searchParams.get("limit") ?? "20", 10);
  const limit = Math.min(
    100,
    Math.max(1, Number.isFinite(rawLimit) ? rawLimit : 20),
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

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
      const { page, limit, skip } = parsePageLimit(searchParams);

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

      const whereAttempts = { testId };
      const attemptOrder = [{ score: "desc" as const }, { completedAt: "asc" as const }];

      const prefixPromise =
        skip > 0
          ? prisma.testAttempt.findMany({
              where: whereAttempts,
              orderBy: attemptOrder,
              skip: 0,
              take: skip,
              select: { completed: true },
            })
          : Promise.resolve([]);

      const [total, attempts, completedForStats, prefixAttempts] = await Promise.all([
        prisma.testAttempt.count({ where: whereAttempts }),
        prisma.testAttempt.findMany({
          where: whereAttempts,
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
          orderBy: attemptOrder,
          skip,
          take: limit,
        }),
        prisma.testAttempt.findMany({
          where: { testId, completed: true },
          select: { score: true },
        }),
        prefixPromise,
      ]);

      const rankOffset = prefixAttempts.filter((a) => a.completed).length;

      const scores = completedForStats.map((a) => a.score);
      const avgScore =
        scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
      const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
      const passCount = scores.filter((s) => s / totalMarks >= 0.4).length;

      let pageCompletedCounter = 0;
      const results = attempts.map((attempt) => ({
        rank: attempt.completed ? rankOffset + ++pageCompletedCounter : null,
        odcetId: attempt.id,
        studentId: attempt.userId,
        studentName: attempt.user.name,
        studentEmail: attempt.user.email,
        studentPhone: attempt.user.phone,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage:
          attempt.totalMarks > 0
            ? Math.round((attempt.score / attempt.totalMarks) * 100)
            : 0,
        status: attempt.completed ? "Completed" : "In Progress",
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        timeTaken:
          attempt.completedAt && attempt.startedAt
            ? Math.round(
                (new Date(attempt.completedAt).getTime() -
                  new Date(attempt.startedAt).getTime()) /
                  60000,
              )
            : null,
      }));

      return NextResponse.json({
        items: results,
        total,
        page,
        limit,
        testTitle: test.title,
        testDescription: test.description,
        totalMarks,
        averageScore: Math.round(avgScore * 10) / 10,
        highestScore,
        lowestScore,
        passCount,
        totalAttempts: total,
      });
    } else {
      // Get summary of all tests with attempt counts
      const tests = await prisma.mockTest.findMany({
        where: { active: true },
        include: {
          subject: { select: { name: true } },
          _count: { select: { attempts: true, questions: true } },
          questions: { select: { marks: true } },
          attempts: {
            where: { completed: true },
            select: { score: true },
            take: 200,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      const summary = tests.map((test) => {
        const scores = test.attempts.map((a) => a.score);
        const avgScore =
          scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        const totalMarks = test.questions.reduce((sum, q) => sum + q.marks, 0);

        return {
          id: test.id,
          title: test.title,
          subject: test.subject.name,
          totalQuestions: test._count.questions,
          totalAttempts: test._count.attempts,
          completedAttempts: test.attempts.length,
          averageScore: Math.round(avgScore * 10) / 10,
          averagePercentage:
            test.attempts.length > 0 && totalMarks > 0
              ? Math.round((avgScore / totalMarks) * 100)
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
