import { NextRequest, NextResponse } from "next/server";
import { ensureContactMessagesTable, getDbClient } from "@/lib/db";

const ADMIN_SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE || "admin_session";
const ADMIN_SESSION_TOKEN =
  process.env.ADMIN_SESSION_TOKEN || "admin_session_token";
const ALLOWED_STATUS = new Set(["new", "processing", "resolved"]);

function hasAdminSession(request: NextRequest): boolean {
  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return session === ADMIN_SESSION_TOKEN;
}

function parseMessageId(rawId: string): number | null {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!hasAdminSession(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idParam } = await params;
    const messageId = parseMessageId(idParam);
    if (!messageId) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = (await request.json()) as {
      status?: string;
      admin_note?: string;
    };

    const nextStatus = typeof body.status === "string" ? body.status : undefined;
    const adminNote =
      typeof body.admin_note === "string"
        ? body.admin_note.trim().slice(0, 2000)
        : undefined;

    if (!nextStatus && adminNote === undefined) {
      return NextResponse.json(
        { error: "status or admin_note is required" },
        { status: 400 }
      );
    }

    if (nextStatus && !ALLOWED_STATUS.has(nextStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await ensureContactMessagesTable();
    const client = await getDbClient();

    try {
      const fields: string[] = ["updated_at = CURRENT_TIMESTAMP"];
      const values: Array<string | number | null> = [];

      if (nextStatus) {
        values.push(nextStatus);
        fields.push(`status = $${values.length}`);
      }

      if (adminNote !== undefined) {
        values.push(adminNote || null);
        fields.push(`admin_note = $${values.length}`);
      }

      values.push(messageId);

      const result = await client.query<Record<string, unknown>>(
        `UPDATE contact_messages
         SET ${fields.join(", ")}
         WHERE id = $${values.length}
         RETURNING
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
           updated_at`,
        values
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Message not found" }, { status: 404 });
      }

      return NextResponse.json({ message: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Failed to update contact message:", error);
    return NextResponse.json(
      { error: "Failed to update contact message" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!hasAdminSession(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idParam } = await params;
    const messageId = parseMessageId(idParam);
    if (!messageId) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await ensureContactMessagesTable();
    const client = await getDbClient();

    try {
      const result = await client.query<{ id: number }>(
        "DELETE FROM contact_messages WHERE id = $1 RETURNING id",
        [messageId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Message not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Failed to delete contact message:", error);
    return NextResponse.json(
      { error: "Failed to delete contact message" },
      { status: 500 }
    );
  }
}
