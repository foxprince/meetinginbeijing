const OSS_PUBLIC_HOST = "meetinginbeijing.oss-cn-beijing.aliyuncs.com";

export function isOssPublicImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname === OSS_PUBLIC_HOST;
  } catch {
    return false;
  }
}

export function toDisplayImageUrl(url: string): string {
  if (!isOssPublicImageUrl(url)) {
    return url;
  }

  const encodedUrl = encodeURIComponent(url);
  return `/api/public-image?url=${encodedUrl}`;
}
