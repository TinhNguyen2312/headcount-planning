import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "JSESSIONID";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Don't intercept static files, API routes, or Next.js internals
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/api-doc") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === "/login";

  if (!sessionId && !isLoginPage) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  if (sessionId && isLoginPage) {
    const url = new URL("/projects", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - api-doc (Swagger UI)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|api-doc|_next/static|_next/image|favicon.ico).*)",
  ],
};
