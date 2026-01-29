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
    const visibility = searchParams.get("visibility");

    let where: any = {};

    if (session.user.role === "STUDENT") {
      // Students can see public questions and their own private questions
      where = {
        OR: [
          { visibility: "PUBLIC" },
          { askedById: session.user.id },
        ],
      };
    } else if (session.user.role === "TEACHER") {
      // Teachers can see public questions and questions targeted to them
      where = {
        OR: [
          { visibility: "PUBLIC" },
          { targetId: session.user.id },
          { visibility: "PRIVATE_TEACHER", targetId: session.user.id },
        ],
      };
    }
    // Admin can see all questions

    if (visibility) {
      where.visibility = visibility;
    }

    const questions = await prisma.question.findMany({
      where,
      include: {
        askedBy: { select: { id: true, name: true } },
        target: { select: { id: true, name: true, role: true } },
        answers: {
          include: {
            answerer: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, visibility, targetId } = body;

    const question = await prisma.question.create({
      data: {
        content,
        visibility: visibility || "PUBLIC",
        askedById: session.user.id,
        targetId: targetId || null,
      },
      include: {
        askedBy: { select: { id: true, name: true } },
        target: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
    }

    const question = await prisma.question.findUnique({ where: { id } });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Only admin or the question author can delete
    if (session.user.role !== "ADMIN" && question.askedById !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.question.delete({ where: { id } });

    return NextResponse.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
