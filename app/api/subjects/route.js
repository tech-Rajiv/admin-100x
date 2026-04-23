import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const subjects = await prisma.subject.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ subjects });
}

export async function POST(request) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const title = String(body?.title || "").trim();
    const description = String(body?.description || "").trim();
    const thumbnail = String(body?.thumbnail || "").trim();

    if (!title || !description || !thumbnail) {
      return NextResponse.json(
        { error: "title, description, thumbnail are required" },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.create({
      data: { title, description, thumbnail },
    });
    return NextResponse.json({ subject }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}

