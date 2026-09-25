import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "JSESSIONID";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Don't intercept static files or Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Root path -> redirect to /projects
  if (pathname === "/") {
    const url = new URL("/projects", request.url);
    const response = NextResponse.redirect(url);
    if (!sessionId) {
      response.cookies.set(SESSION_COOKIE_NAME, "mock_session_active", {
        path: "/",
        maxAge: 31536000,
      });
    }
    return response;
  }

  // Ensure mock session cookie is present for any non-login route for seamless UI dev
  if (!sessionId && pathname !== "/login") {
    const response = NextResponse.next();
    response.cookies.set(SESSION_COOKIE_NAME, "mock_session_active", {
      path: "/",
      maxAge: 31536000,
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
