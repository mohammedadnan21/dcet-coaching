import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const testId = searchParams.get("testId");

    if (!testId) {
      return NextResponse.json({ error: "Test ID is required" }, { status: 400 });
    }

    // Check if test has rankings enabled
    const test = await prisma.mockTest.findUnique({
      where: { id: testId },
      select: { showRanking: true, title: true },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    if (!test.showRanking) {
      return NextResponse.json({ error: "Rankings not enabled for this test" }, { status: 403 });
    }

    // Get all completed attempts for this test
    const attempts = await prisma.testAttempt.findMany({
      where: {
        testId,
        completed: true,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: [
        { score: "desc" },
        { completedAt: "asc" },
      ],
      take: 50,
    });

    // Assign ranks
    const rankings = attempts.map((attempt, index) => ({
      rank: index + 1,
      userId: attempt.userId,
      userName: attempt.user.name,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: Math.round((attempt.score / attempt.totalMarks) * 100),
      completedAt: attempt.completedAt,
      isCurrentUser: attempt.userId === session.user.id,
    }));

    return NextResponse.json({
      testTitle: test.title,
      rankings,
    });
  } catch (error) {
    console.error("Error fetching rankings:", error);
    return NextResponse.json({ error: "Failed to fetch rankings" }, { status: 500 });
  }
}
