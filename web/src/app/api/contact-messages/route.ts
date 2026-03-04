import { NextRequest, NextResponse } from "next/server";
import { ensureContactMessagesTable, getDbClient } from "@/lib/db";
import { CreateContactMessageRequest } from "@/types/contact-message";

function trimText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().slice(0, maxLength);
}

function normalizePreferredDate(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const trimmed = value.trim();
  const isIsoDate = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
  if (!isIsoDate) {
    return null;
  }
  return trimmed;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateContactMessageRequest;
    const name = trimText(body?.name, 120);
    const country = trimText(body?.country, 120);
    const contact = trimText(body?.contact, 255);
    const serviceType = trimText(body?.service_type, 255);
    const message = trimText(body?.message, 5000);
    const preferredDate = normalizePreferredDate(body?.preferred_date);

    if (!name || !contact || !message) {
      return NextResponse.json(
        { error: "name, contact and message are required" },
        { status: 400 }
      );
    }

    await ensureContactMessagesTable();
    const client = await getDbClient();

    try {
      const result = await client.query(
        `INSERT INTO contact_messages (
          name,
          country,
          contact,
          service_type,
          preferred_date,
          message,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, 'new')
        RETURNING id, created_at`,
        [
          name,
          country || null,
          contact,
          serviceType || null,
          preferredDate,
          message,
        ]
      );

      return NextResponse.json(
        {
          success: true,
          id: result.rows[0].id,
          created_at: result.rows[0].created_at,
        },
        { status: 201 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Failed to create contact message:", error);
    return NextResponse.json(
      { error: "Failed to submit message" },
      { status: 500 }
    );
  }
}
