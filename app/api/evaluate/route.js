import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED_ORIGINS = new Set([
  "https://100xlife.online",
  "https://www.100xlife.online",
  // Dev convenience (safe to keep; only applies when Origin matches)
  "http://localhost:3000",
  "http://localhost:3001",
]);

function corsHeaders(request) {
  const origin = request?.headers?.get?.("origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "";

  return {
    ...(allowOrigin ? { "Access-Control-Allow-Origin": allowOrigin } : {}),
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function OPTIONS(request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request) {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: corsHeaders(request) }
    );
  }

  try {
    const body = await request.json();
    const testId = Number(body?.testId);
    const answers = Array.isArray(body?.answers) ? body.answers : [];

    if (!Number.isFinite(testId)) {
      return NextResponse.json(
        { error: "testId is required" },
        { status: 400, headers: corsHeaders(request) }
      );
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
    }, { headers: corsHeaders(request) });
  } catch {
    return NextResponse.json(
      { error: "Failed to evaluate answers" },
      { status: 500, headers: corsHeaders(request) }
    );
  }
}

