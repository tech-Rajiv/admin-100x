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

  const test = await prisma.test.findUnique({
    where: { id },
    include: {
      subject: true,
      questions: {
        orderBy: { id: "asc" },
        include: { options: { orderBy: { id: "asc" } } },
      },
    },
  });

  if (!test) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ test });
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

    const test = await prisma.test.update({
      where: { id },
      data: { title, description, thumbnail },
    });
    return NextResponse.json({ test });
  } catch {
    return NextResponse.json({ error: "Failed to update test" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = asId(params);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    await prisma.test.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete test" }, { status: 500 });
  }
}

