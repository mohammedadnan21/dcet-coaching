import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { questionId, content } = body;

    if (!questionId || !content) {
      return NextResponse.json({ error: "Question ID and content are required" }, { status: 400 });
    }

    const answer = await prisma.answer.create({
      data: {
        questionId,
        content,
        answeredBy: session.user.id,
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
