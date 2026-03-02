import { NextResponse } from "next/server";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "password";
const ADMIN_SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE || "admin_session";
const ADMIN_SESSION_TOKEN = process.env.ADMIN_SESSION_TOKEN || "admin_session_token";
const SESSION_MAX_AGE_SECONDS = Number(process.env.ADMIN_SESSION_MAX_AGE || 60 * 60 * 12);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body || {};

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, ADMIN_SESSION_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
