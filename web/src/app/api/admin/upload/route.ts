import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/oss";

const ADMIN_SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE || "admin_session";
const ADMIN_SESSION_TOKEN = process.env.ADMIN_SESSION_TOKEN || "admin_session_token";
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_KEY_PREFIX = process.env.S3_KEY_PREFIX || "";
const S3_PUBLIC_BASE_URL = process.env.S3_PUBLIC_BASE_URL;

if (!S3_BUCKET_NAME || !S3_PUBLIC_BASE_URL) {
  throw new Error("S3_BUCKET_NAME and S3_PUBLIC_BASE_URL must be configured");
}

function buildObjectKey(filename?: string | null) {
  const safeName = filename || "upload";
  const ext = path.extname(safeName);
  const base = safeName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-_\.]/g, "");
  return `${S3_KEY_PREFIX}${Date.now()}-${randomUUID()}${ext || path.extname(base)}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (session !== ADMIN_SESSION_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const key = buildObjectKey(file.name);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
        ACL: "public-read",
      })
    );

    const fileUrl = `${S3_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`;

    return NextResponse.json({ url: fileUrl, key });
  } catch (error) {
    console.error("OSS upload failed:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
