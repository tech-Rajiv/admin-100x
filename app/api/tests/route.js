import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get("subjectId");
  const where = {};
  if (subjectId != null && subjectId !== "") {
    const sid = Number(subjectId);
    if (!Number.isFinite(sid)) {
      return NextResponse.json({ error: "Invalid subjectId" }, { status: 400 });
    }
    where.subjectId = sid;
  }

  const tests = await prisma.test.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tests });
}

export async function POST(request) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const subjectId = Number(body?.subjectId);
    const title = String(body?.title || "").trim();
    const description = String(body?.description || "").trim();
    const thumbnail = String(body?.thumbnail || "").trim();

    if (!Number.isFinite(subjectId)) {
      return NextResponse.json({ error: "subjectId is required" }, { status: 400 });
    }
    if (!title || !description || !thumbnail) {
      return NextResponse.json(
        { error: "title, description, thumbnail are required" },
        { status: 400 }
      );
    }

    const test = await prisma.test.create({
      data: { subjectId, title, description, thumbnail },
    });
    return NextResponse.json({ test }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create test" }, { status: 500 });
  }
}

