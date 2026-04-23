import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

function asId(params) {
  const id = Number(params?.id);
  return Number.isFinite(id) ? id : null;
}

export async function GET(request, { params }) {
  const id = asId(params);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const subject = await prisma.subject.findUnique({
    where: { id },
    include: { tests: { orderBy: { createdAt: "desc" } } },
  });
  if (!subject) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ subject });
}

export async function PUT(request, { params }) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = asId(params);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

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

    const subject = await prisma.subject.update({
      where: { id },
      data: { title, description, thumbnail },
    });
    return NextResponse.json({ subject });
  } catch {
    return NextResponse.json(
      { error: "Failed to update subject" },
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
    await prisma.subject.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete subject" },
      { status: 500 }
    );
  }
}

