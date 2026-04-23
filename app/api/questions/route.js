import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

function normalizeType(type) {
  const t = String(type || "").toUpperCase();
  if (t === "MCQ" || t === "YES_NO" || t === "SCALE") return t;
  return null;
}

function validateOptions(options) {
  if (!Array.isArray(options) || options.length < 2) {
    return "At least 2 options are required";
  }
  const normalized = options
    .map((o) => ({
      text: String(o?.text || "").trim(),
      isCorrect: Boolean(o?.isCorrect),
    }))
    .filter((o) => o.text);

  if (normalized.length < 2) return "At least 2 non-empty options are required";
  if (!normalized.some((o) => o.isCorrect)) return "Mark at least one correct option";
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const testId = searchParams.get("testId");
  if (testId == null || testId === "") {
    return NextResponse.json({ error: "testId is required" }, { status: 400 });
  }
  const tid = Number(testId);
  if (!Number.isFinite(tid)) {
    return NextResponse.json({ error: "Invalid testId" }, { status: 400 });
  }

  const questions = await prisma.question.findMany({
    where: { testId: tid },
    orderBy: { id: "asc" },
    include: { options: { orderBy: { id: "asc" } } },
  });
  return NextResponse.json({ questions });
}

export async function POST(request) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const testId = Number(body?.testId);
    const questionText = String(body?.questionText || "").trim();
    const image = body?.image ? String(body.image).trim() : null;
    const type = normalizeType(body?.type);
    const options = body?.options;

    if (!Number.isFinite(testId)) {
      return NextResponse.json({ error: "testId is required" }, { status: 400 });
    }
    if (!questionText) {
      return NextResponse.json(
        { error: "questionText is required" },
        { status: 400 }
      );
    }
    if (!type) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const optionsError = validateOptions(options);
    if (optionsError) {
      return NextResponse.json({ error: optionsError }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        testId,
        questionText,
        image,
        type,
        options: {
          create: options
            .map((o) => ({
              text: String(o?.text || "").trim(),
              isCorrect: Boolean(o?.isCorrect),
            }))
            .filter((o) => o.text),
        },
      },
      include: { options: { orderBy: { id: "asc" } } },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}

