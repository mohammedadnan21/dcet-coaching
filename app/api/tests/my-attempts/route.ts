import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - Fetch current user's test attempts
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const attempts = await prisma.testAttempt.findMany({
      where: {
        userId: session.user.id,
      },
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
    });

    const formattedAttempts = attempts.map((attempt) => ({
      id: attempt.id,
      testId: attempt.test.id,
      testTitle: attempt.test.title,
      subject: attempt.test.subject.name,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: attempt.totalMarks > 0 
        ? Math.round((attempt.score / attempt.totalMarks) * 100) 
        : 0,
      completed: attempt.completed,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
    }));

    return NextResponse.json(formattedAttempts);
  } catch (error) {
    console.error("Error fetching attempts:", error);
    return NextResponse.json({ error: "Failed to fetch attempts" }, { status: 500 });
  }
}
