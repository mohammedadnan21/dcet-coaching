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

    const rl = rateLimit(`attempt:${session.user.id}`, 5, 60_000);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many attempts. Please wait a moment." }, { status: 429 });
    }

    const body = await request.json();
    const { testId } = body;

    if (!testId) {
      return NextResponse.json({ error: "Test ID is required" }, { status: 400 });
    }

    // Check if attempt already exists
    let attempt = await prisma.testAttempt.findUnique({
      where: {
        testId_userId: {
          testId,
          userId: session.user.id,
        },
      },
      include: {
        test: {
          include: {
            questions: true,
          },
        },
        answers: true,
      },
    });

    if (attempt?.completed) {
      return NextResponse.json({ error: "Test already completed" }, { status: 400 });
    }

    if (!attempt) {
      // Create new attempt
      const test = await prisma.mockTest.findUnique({
        where: { id: testId },
        include: { questions: true },
      });

      if (!test) {
        return NextResponse.json({ error: "Test not found" }, { status: 404 });
      }

      if (!test.active) {
        return NextResponse.json({ error: "This test is no longer available" }, { status: 400 });
      }

      const totalMarks = test.questions.reduce((sum, q) => sum + q.marks, 0);

      attempt = await prisma.testAttempt.create({
        data: {
          testId,
          userId: session.user.id,
          totalMarks,
        },
        include: {
          test: {
            include: {
              questions: true,
            },
          },
          answers: true,
        },
      });
    }

    // Return test with questions (without correct answers)
    const questionsForStudent = attempt.test.questions.map((q) => ({
      id: q.id,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      marks: q.marks,
    }));

    return NextResponse.json({
      attemptId: attempt.id,
      testId: attempt.testId,
      title: attempt.test.title,
      duration: attempt.test.duration,
      startedAt: attempt.startedAt,
      questions: questionsForStudent,
      savedAnswers: attempt.answers.map((a) => ({
        questionId: a.questionId,
        selectedOption: a.selectedOption,
      })),
    });
  } catch (error) {
    console.error("Error starting test:", error);
    return NextResponse.json({ error: "Failed to start test" }, { status: 500 });
  }
}

// Submit answer for a question
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { attemptId, questionId, selectedOption } = body;

    // Get the attempt
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt || attempt.userId !== session.user.id) {
      return NextResponse.json({ error: "Invalid attempt" }, { status: 400 });
    }

    if (attempt.completed) {
      return NextResponse.json({ error: "Test already completed" }, { status: 400 });
    }

    const validOptions = ["A", "B", "C", "D"];
    if (!selectedOption || !validOptions.includes(selectedOption)) {
      return NextResponse.json({ error: "Invalid option. Must be A, B, C, or D" }, { status: 400 });
    }

    const question = await prisma.mCQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    if (question.testId !== attempt.testId) {
      return NextResponse.json({ error: "Question does not belong to this test" }, { status: 400 });
    }

    const isCorrect = selectedOption === question.correctOption;

    // Upsert the answer
    await prisma.testAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      update: {
        selectedOption,
        isCorrect,
      },
      create: {
        attemptId,
        questionId,
        selectedOption,
        isCorrect,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving answer:", error);
    return NextResponse.json({ error: "Failed to save answer" }, { status: 500 });
  }
}
