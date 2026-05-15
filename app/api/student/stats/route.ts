import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get test attempts for this student (capped for performance)
    const testAttempts = await prisma.testAttempt.findMany({
      where: { userId },
      take: 500,
      include: {
        test: {
          select: {
            title: true,
            subjectId: true,
            subject: { select: { name: true } },
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    // Calculate stats
    const totalTests = testAttempts.length;
    const completedTests = testAttempts.filter((a) => a.completed).length;
    const totalScore = testAttempts.reduce((sum, a) => sum + a.score, 0);
    const totalMarks = testAttempts.reduce((sum, a) => sum + a.totalMarks, 0);
    const averageScore = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;

    // Get best score
    const bestScore = testAttempts.reduce((best, a) => {
      const percentage = a.totalMarks > 0 ? (a.score / a.totalMarks) * 100 : 0;
      return percentage > best ? percentage : best;
    }, 0);

    // Get videos count
    const videosCount = await prisma.video.count({
      where: { subject: { active: true } },
    });

    // Get upcoming meetings count
    const upcomingMeetings = await prisma.meeting.count({
      where: {
        scheduledAt: { gte: new Date() },
        cancelled: false,
      },
    });

    // Get user's ranking among all students
    const allStudentScores = await prisma.testAttempt.groupBy({
      by: ["userId"],
      _sum: { score: true },
      where: { completed: true },
    });

    const sortedScores = allStudentScores
      .map((s) => ({ userId: s.userId, score: s._sum.score || 0 }))
      .sort((a, b) => b.score - a.score);

    const userRank = sortedScores.findIndex((s) => s.userId === userId) + 1;
    const totalStudents = sortedScores.length;

    // Get subject-wise performance
    const subjectPerformance = testAttempts.reduce((acc, attempt) => {
      const subjectName = attempt.test.subject?.name || "Unknown";
      if (!acc[subjectName]) {
        acc[subjectName] = { totalScore: 0, totalMarks: 0, attempts: 0 };
      }
      acc[subjectName].totalScore += attempt.score;
      acc[subjectName].totalMarks += attempt.totalMarks;
      acc[subjectName].attempts += 1;
      return acc;
    }, {} as Record<string, { totalScore: number; totalMarks: number; attempts: number }>);

    const subjectStats = Object.entries(subjectPerformance).map(([name, data]) => ({
      name,
      percentage: data.totalMarks > 0 ? Math.round((data.totalScore / data.totalMarks) * 100) : 0,
      attempts: data.attempts,
    }));

    // Recent activity
    const recentTests = testAttempts.slice(0, 5).map((a) => ({
      id: a.id,
      testTitle: a.test.title,
      score: a.score,
      totalMarks: a.totalMarks,
      percentage: a.totalMarks > 0 ? Math.round((a.score / a.totalMarks) * 100) : 0,
      completedAt: a.completedAt,
      subject: a.test.subject?.name,
    }));

    // Calculate streak (consecutive days with activity)
    const activityDates = testAttempts
      .filter((a) => a.completedAt)
      .map((a) => new Date(a.completedAt!).toDateString());
    
    const uniqueDates = Array.from(new Set(activityDates)).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < uniqueDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      if (uniqueDates.includes(checkDate.toDateString())) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return NextResponse.json({
      overview: {
        totalTests,
        completedTests,
        averageScore,
        bestScore: Math.round(bestScore),
        streak,
        rank: userRank || null,
        totalStudents,
        videosAvailable: videosCount,
        upcomingMeetings,
      },
      subjectStats,
      recentTests,
    });
  } catch (error) {
    console.error("Error fetching student stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
