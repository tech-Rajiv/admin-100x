import { NextResponse } from "next/server";
import { getCloudinaryConfig } from "@/lib/cloudinary";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cfg = getCloudinaryConfig();
  return NextResponse.json(cfg);
}

