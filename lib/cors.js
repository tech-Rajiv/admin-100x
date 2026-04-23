import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = new Set([
  "https://100xlife.online",
  "https://www.100xlife.online",
  "http://localhost:3000",
  "http://localhost:3001",
]);

export function corsHeaders(request, methods = "GET, OPTIONS") {
  const origin = request?.headers?.get?.("origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "";

  return {
    ...(allowOrigin ? { "Access-Control-Allow-Origin": allowOrigin } : {}),
    Vary: "Origin",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    // Keep credentials off for public endpoints; avoids cookie/CORS pitfalls.
  };
}

export function corsOptions(request, methods = "GET, OPTIONS") {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request, methods) });
}

