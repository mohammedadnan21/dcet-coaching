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

    const where: any = { active: true };
    if (subjectId) {
      where.subjectId = subjectId;
    }

    const tests = await prisma.mockTest.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
        questions: withQuestions,
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tests);
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

    const test = await prisma.mockTest.create({
      data: {
        title,
        description,
        subjectId,
        duration: parseInt(duration),
        showRanking: showRanking || false,
        createdBy: session.user.id,
        questions: {
          create: questions.map((q: any) => ({
            question: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctOption: q.correctOption,
            marks: q.marks || 1,
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

    const updateData: any = {};
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
