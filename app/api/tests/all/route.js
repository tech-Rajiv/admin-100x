import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { corsHeaders, corsOptions } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS(request) {
  return corsOptions(request, "GET, OPTIONS");
}

export async function GET(request) {
  const tests = await prisma.test.findMany({
    orderBy: { createdAt: "desc" },
    include: { subject: true },
  });

  return NextResponse.json(
    { tests },
    { headers: corsHeaders(request, "GET, OPTIONS") }
  );
}

