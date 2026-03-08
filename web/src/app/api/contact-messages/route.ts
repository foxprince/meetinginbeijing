import { NextRequest, NextResponse } from "next/server";
import { ensureContactMessagesTable, getDbClient } from "@/lib/db";
import { sendNewMessageSms } from "@/lib/sms";
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

function formatMessageTime(dateInput: string | Date): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
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
      const result = await client.query<{ id: number; created_at: string }>(
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

      const createdAt = result.rows[0].created_at;
      let smsNotified = true;
      let smsError = "";

      try {
        await sendNewMessageSms({
          name,
          time: formatMessageTime(createdAt),
        });
      } catch (error) {
        smsNotified = false;
        smsError = error instanceof Error ? error.message : "SMS notify failed";
        console.error("Failed to send new message SMS notification:", error);
      }

      return NextResponse.json(
        {
          success: true,
          id: result.rows[0].id,
          created_at: createdAt,
          sms_notified: smsNotified,
          sms_error: smsError || undefined,
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
