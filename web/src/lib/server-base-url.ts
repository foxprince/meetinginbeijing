import { headers } from "next/headers";

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/$/, "");
}

export async function getServerBaseUrl(): Promise<string> {
  const internalBaseUrl = process.env.INTERNAL_BASE_URL;
  if (internalBaseUrl) {
    return normalizeBaseUrl(internalBaseUrl);
  }

  const publicBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (publicBaseUrl) {
    return normalizeBaseUrl(publicBaseUrl);
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${proto}://${host}`;
  }

  return "http://127.0.0.1:3000";
}
