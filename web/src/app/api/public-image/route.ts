import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "node:stream";
import { s3Client } from "@/lib/oss";

const OSS_PUBLIC_HOST = "meetinginbeijing.oss-cn-beijing.aliyuncs.com";
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

function extractObjectKey(imageUrl: string): string | null {
  try {
    const parsedUrl = new URL(imageUrl);

    if (parsedUrl.protocol !== "https:" || parsedUrl.hostname !== OSS_PUBLIC_HOST) {
      return null;
    }

    const key = decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ""));
    return key || null;
  } catch {
    return null;
  }
}

function toWebStream(body: unknown): ReadableStream<Uint8Array> | null {
  if (!body) {
    return null;
  }

  const streamBody = body as {
    transformToWebStream?: () => ReadableStream<Uint8Array>;
  };

  if (typeof streamBody.transformToWebStream === "function") {
    return streamBody.transformToWebStream();
  }

  if (body instanceof Readable) {
    return Readable.toWeb(body) as ReadableStream<Uint8Array>;
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    if (!S3_BUCKET_NAME) {
      return NextResponse.json(
        { error: "S3_BUCKET_NAME is not configured" },
        { status: 500 }
      );
    }

    const imageUrl = request.nextUrl.searchParams.get("url") || "";
    const key = extractObjectKey(imageUrl);

    if (!key) {
      return NextResponse.json({ error: "Invalid image url" }, { status: 400 });
    }

    const object = await s3Client.send(
      new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
      })
    );

    const stream = toWebStream(object.Body);
    if (!stream) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return new NextResponse(stream, {
      headers: {
        "Content-Type": object.ContentType || "application/octet-stream",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("Failed to proxy OSS image:", error);
    return NextResponse.json({ error: "Failed to load image" }, { status: 500 });
  }
}
