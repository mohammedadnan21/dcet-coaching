import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = rateLimit(`submit:${session.user.id}`, 3, 60_000);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many submissions. Please wait." }, { status: 429 });
    }

    const body = await request.json();
    const { attemptId } = body;

    // Get the attempt with answers
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
        test: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!attempt || attempt.userId !== session.user.id) {
      return NextResponse.json({ error: "Invalid attempt" }, { status: 400 });
    }

    if (attempt.completed) {
      return NextResponse.json({ error: "Test already submitted" }, { status: 400 });
    }

    // Calculate score
    let score = 0;
    for (const answer of attempt.answers) {
      if (answer.isCorrect) {
        score += answer.question.marks;
      }
    }

    // Update attempt as completed
    const updatedAttempt = await prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        score,
        completed: true,
        completedAt: new Date(),
      },
    });

    // Generate result with correct answers
    const results = attempt.test.questions.map((q) => {
      const answer = attempt.answers.find((a) => a.questionId === q.id);
      return {
        questionId: q.id,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        selectedOption: answer?.selectedOption || null,
        isCorrect: answer?.isCorrect || false,
        marks: q.marks,
      };
    });

    const percentage = attempt.totalMarks > 0
      ? Math.round((score / attempt.totalMarks) * 100)
      : 0;

    return NextResponse.json({
      score,
      totalMarks: attempt.totalMarks,
      percentage,
      results,
    });
  } catch (error) {
    console.error("Error submitting test:", error);
    return NextResponse.json({ error: "Failed to submit test" }, { status: 500 });
  }
}
