const OSS_PUBLIC_HOST = "meetinginbeijing.oss-cn-beijing.aliyuncs.com";

export function isOssPublicImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname === OSS_PUBLIC_HOST;
  } catch {
    return false;
  }
}
