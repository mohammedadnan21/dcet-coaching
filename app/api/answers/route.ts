import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { questionId, content } = body;

    if (!questionId || !content || typeof content !== "string") {
      return NextResponse.json({ error: "Question ID and content are required" }, { status: 400 });
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: "Answer is too long (max 5000 characters)" }, { status: 400 });
    }

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }
    if (question.visibility === "PRIVATE_TEACHER" && question.targetId && question.targetId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "You are not authorized to answer this question" }, { status: 403 });
    }

    const answer = await prisma.answer.create({
      data: {
        id: uuidv4(),
        questionId,
        content,
        answeredBy: session.user.id,
        updatedAt: new Date(),
      },
      include: {
        answerer: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json(answer, { status: 201 });
  } catch (error) {
    console.error("Error creating answer:", error);
    return NextResponse.json({ error: "Failed to create answer" }, { status: 500 });
  }
}
