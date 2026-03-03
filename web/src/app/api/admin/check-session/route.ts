import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE || 'admin_session';
const ADMIN_SESSION_TOKEN = process.env.ADMIN_SESSION_TOKEN || 'admin_session_token';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE);

  if (sessionCookie && sessionCookie.value === ADMIN_SESSION_TOKEN) {
    return NextResponse.json({ isAdmin: true });
  }

  return NextResponse.json({ isAdmin: false });
}
