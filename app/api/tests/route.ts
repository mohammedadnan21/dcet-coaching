import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const subjectId = searchParams.get("subjectId");
    const withQuestions = searchParams.get("withQuestions") === "true";
    const isPrivileged = session.user.role === "ADMIN" || session.user.role === "TEACHER";

    const where: Record<string, unknown> = { active: true };
    if (subjectId) {
      where.subjectId = subjectId;
    }

    const tests = await prisma.mockTest.findMany({
      where,
      take: 50,
      include: {
        subject: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
        questions: withQuestions && isPrivileged
          ? true
          : withQuestions
            ? { select: { id: true, question: true, optionA: true, optionB: true, optionC: true, optionD: true, marks: true } }
            : false,
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tests, {
      headers: { "Cache-Control": "private, s-maxage=30, stale-while-revalidate=15" },
    });
  } catch (error) {
    console.error("Error fetching tests:", error);
    return NextResponse.json({ error: "Failed to fetch tests" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, subjectId, duration, showRanking, questions } = body;

    if (!title || !subjectId || !duration || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "Title, subject, duration, and at least one question are required" }, { status: 400 });
    }

    const parsedDuration = parseInt(duration);
    if (isNaN(parsedDuration) || parsedDuration < 1) {
      return NextResponse.json({ error: "Duration must be a positive number" }, { status: 400 });
    }

    const validOptions = ["A", "B", "C", "D"];
    for (const q of questions) {
      if (!q.question || !q.optionA || !q.optionB || !q.optionC || !q.optionD || !validOptions.includes(q.correctOption)) {
        return NextResponse.json({ error: "Each question must have text, 4 options, and a valid correct option (A-D)" }, { status: 400 });
      }
    }

    const test = await prisma.mockTest.create({
      data: {
        title,
        description,
        subjectId,
        duration: parsedDuration,
        showRanking: showRanking || false,
        createdBy: session.user.id,
        questions: {
          create: questions.map((q: Record<string, unknown>) => ({
            question: q.question as string,
            optionA: q.optionA as string,
            optionB: q.optionB as string,
            optionC: q.optionC as string,
            optionD: q.optionD as string,
            correctOption: q.correctOption as string,
            marks: (q.marks as number) || 1,
          })),
        },
      },
      include: {
        subject: true,
        questions: true,
      },
    });

    return NextResponse.json(test, { status: 201 });
  } catch (error) {
    console.error("Error creating test:", error);
    return NextResponse.json({ error: "Failed to create test" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, showRanking, active } = body;

    const updateData: Record<string, boolean> = {};
    if (showRanking !== undefined) updateData.showRanking = showRanking;
    if (active !== undefined) updateData.active = active;

    const test = await prisma.mockTest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(test);
  } catch (error) {
    console.error("Error updating test:", error);
    return NextResponse.json({ error: "Failed to update test" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Test ID is required" }, { status: 400 });
    }

    await prisma.mockTest.delete({ where: { id } });

    return NextResponse.json({ message: "Test deleted successfully" });
  } catch (error) {
    console.error("Error deleting test:", error);
    return NextResponse.json({ error: "Failed to delete test" }, { status: 500 });
  }
}
