import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

function asId(params) {
  const id = Number(params?.id);
  return Number.isFinite(id) ? id : null;
}

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

export async function PUT(request, { params }) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = asId(params);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const body = await request.json();
    const questionText = String(body?.questionText || "").trim();
    const image = body?.image ? String(body.image).trim() : null;
    const type = normalizeType(body?.type);
    const options = body?.options;

    if (!questionText) {
      return NextResponse.json(
        { error: "questionText is required" },
        { status: 400 }
      );
    }
    if (!type) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

    const optionsError = validateOptions(options);
    if (optionsError) {
      return NextResponse.json({ error: optionsError }, { status: 400 });
    }

    const question = await prisma.question.update({
      where: { id },
      data: {
        questionText,
        image,
        type,
        options: {
          deleteMany: {},
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

    return NextResponse.json({ question });
  } catch {
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = asId(params);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    await prisma.question.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}

