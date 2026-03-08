import { NextRequest, NextResponse } from "next/server";
import { ensureContactMessagesTable, getDbClient } from "@/lib/db";

const ADMIN_SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE || "admin_session";
const ADMIN_SESSION_TOKEN =
  process.env.ADMIN_SESSION_TOKEN || "admin_session_token";

function hasAdminSession(request: NextRequest): boolean {
  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return session === ADMIN_SESSION_TOKEN;
}

export async function GET(request: NextRequest) {
  try {
    if (!hasAdminSession(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const keyword = (searchParams.get("keyword") || "").trim();
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 100);

    await ensureContactMessagesTable();
    const client = await getDbClient();

    try {
      const values: Array<string | number> = [];
      const conditions: string[] = [];

      if (status !== "all") {
        values.push(status);
        conditions.push(`status = $${values.length}`);
      }

      if (keyword) {
        values.push(`%${keyword}%`);
        conditions.push(
          `(name ILIKE $${values.length} OR contact ILIKE $${values.length} OR message ILIKE $${values.length})`
        );
      }

      values.push(limit);

      const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

      const result = await client.query<Record<string, unknown>>(
        `SELECT
          id,
          name,
          country,
          contact,
          service_type,
          preferred_date,
          message,
          status,
          admin_note,
          created_at,
          updated_at
        FROM contact_messages
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${values.length}`,
        values
      );

      return NextResponse.json({ messages: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Failed to list contact messages:", error);
    return NextResponse.json(
      { error: "Failed to list contact messages" },
      { status: 500 }
    );
  }
}
