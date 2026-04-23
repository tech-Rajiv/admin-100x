import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "admin_token";
const ALLOWED_ORIGINS = new Set([
  "https://100xlife.online",
  "https://www.100xlife.online",
  "http://localhost:3000",
  "http://localhost:3001",
]);

function withCors(request, response) {
  const origin = request.headers.get("origin") || "";
  if (ALLOWED_ORIGINS.has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
    response.headers.set(
      "Access-Control-Allow-Headers",
      request.headers.get("access-control-request-headers") ||
        "Content-Type, Authorization"
    );
    response.headers.set(
      "Access-Control-Allow-Methods",
      request.headers.get("access-control-request-method") || "GET,POST,PUT,DELETE,OPTIONS"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return response;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Handle API CORS preflight globally.
  if (pathname.startsWith("/api/") && method === "OPTIONS") {
    return withCors(request, new NextResponse(null, { status: 204 }));
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const isLoginRoute = pathname === "/login";
  const isAuthApi = pathname.startsWith("/api/auth/");
  const isPublicApi =
    isAuthApi ||
    // Public read APIs for the consumer app
    ((method === "GET" || method === "OPTIONS") &&
      (pathname === "/api/subjects" ||
        pathname.startsWith("/api/subjects/") ||
        pathname === "/api/tests" ||
        pathname.startsWith("/api/tests/") ||
        pathname === "/api/questions" ||
        pathname.startsWith("/api/questions/"))) ||
    // Public evaluation endpoint (called from the consumer app)
    (pathname === "/api/evaluate" && (method === "POST" || method === "OPTIONS"));

  if (isLoginRoute || isPublicApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return withCors(
        request,
        NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Ensure API responses always have CORS headers when called cross-site.
  if (pathname.startsWith("/api/")) {
    return withCors(request, NextResponse.next());
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

