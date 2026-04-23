import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "admin_token";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const method = request.method;

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

