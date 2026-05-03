import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

// GET - Fetch current user's test attempts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { page, limit, skip } = parsePageLimit(request.nextUrl.searchParams);

    const where = { userId: session.user.id };

    const [attempts, total] = await Promise.all([
      prisma.testAttempt.findMany({
        where,
        include: {
          test: {
            select: {
              id: true,
              title: true,
              subject: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: {
          startedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.testAttempt.count({ where }),
    ]);

    const formattedAttempts = attempts.map((attempt) => ({
      id: attempt.id,
      testId: attempt.test.id,
      testTitle: attempt.test.title,
      subject: attempt.test.subject.name,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage:
        attempt.totalMarks > 0
          ? Math.round((attempt.score / attempt.totalMarks) * 100)
          : 0,
      completed: attempt.completed,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
    }));

    return NextResponse.json({
      items: formattedAttempts,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching attempts:", error);
    return NextResponse.json({ error: "Failed to fetch attempts" }, { status: 500 });
  }
}
