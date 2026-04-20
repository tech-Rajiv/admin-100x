import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const testId = Number(body?.testId);
    const answers = Array.isArray(body?.answers) ? body.answers : [];

    if (!Number.isFinite(testId)) {
      return NextResponse.json({ error: "testId is required" }, { status: 400 });
    }

    const questions = await prisma.question.findMany({
      where: { testId },
      include: { options: true },
      orderBy: { id: "asc" },
    });

    const answerMap = new Map(
      answers
        .map((a) => ({
          questionId: Number(a?.questionId),
          selectedOptionId: a?.selectedOptionId == null ? null : Number(a.selectedOptionId),
        }))
        .filter((a) => Number.isFinite(a.questionId))
        .map((a) => [a.questionId, a.selectedOptionId])
    );

    const results = questions.map((q) => {
      const correctOption = q.options.find((o) => o.isCorrect) || null;
      const selectedOptionId = answerMap.has(q.id) ? answerMap.get(q.id) : null;
      const isCorrect =
        correctOption && selectedOptionId != null
          ? Number(selectedOptionId) === correctOption.id
          : false;

      return {
        questionId: q.id,
        isCorrect,
        correctOptionId: correctOption ? correctOption.id : null,
        selectedOptionId: selectedOptionId == null ? null : Number(selectedOptionId),
      };
    });

    const correctAnswers = results.filter((r) => r.isCorrect).length;
    const wrongAnswers = results.length - correctAnswers;

    return NextResponse.json({
      totalQuestions: results.length,
      correctAnswers,
      wrongAnswers,
      results,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to evaluate answers" },
      { status: 500 }
    );
  }
}

