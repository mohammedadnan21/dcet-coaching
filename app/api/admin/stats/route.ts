import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalStudents,
      totalTeachers,
      pendingApprovals,
      totalSubjects,
      totalVideos,
      upcomingMeetings,
      activeTests,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT", status: "APPROVED" } }),
      prisma.user.count({ where: { role: "TEACHER", status: "APPROVED" } }),
      prisma.user.count({ where: { status: "PENDING" } }),
      prisma.subject.count({ where: { active: true } }),
      prisma.video.count(),
      prisma.meeting.count({
        where: { scheduledAt: { gte: new Date() }, cancelled: false },
      }),
      prisma.mockTest.count({ where: { active: true } }),
    ]);

    return NextResponse.json({
      totalStudents,
      totalTeachers,
      pendingApprovals,
      totalSubjects,
      totalVideos,
      upcomingMeetings,
      activeTests,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
