import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE || "admin_session";
const ADMIN_SESSION_TOKEN = process.env.ADMIN_SESSION_TOKEN || "admin_session_token";
const LOGIN_PATH = "/admin/login";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === LOGIN_PATH) {
    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (session === ADMIN_SESSION_TOKEN) {
      const redirectUrl = new URL("/admin/blog", request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (session !== ADMIN_SESSION_TOKEN) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    if (pathname !== "/admin") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
