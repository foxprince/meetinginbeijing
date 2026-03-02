import fs from "node:fs";
import { promises as fsp, constants as fsConstants } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import * as cheerio from "cheerio";

const WP_BASE_URL = process.env.WP_BASE_URL || "https://meetinginbeijing.com";
const TARGET_BASE_URL =
  process.env.TARGET_BASE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";
const PAGE_SIZE = Number(process.env.WP_PAGE_SIZE || 50);
const WP_POSTS_FILE = process.env.WP_POSTS_FILE;
const BLOG_IMAGE_DIR =
  process.env.BLOG_IMAGE_DIR || path.join(process.cwd(), "public", "blog-images");
const BLOG_IMAGE_PUBLIC_PATH = process.env.BLOG_IMAGE_PUBLIC_PATH || "/blog-images";

interface WPMedia {
  source_url?: string;
}

const downloadedImages = new Map<string, string>();

interface WPPost {
  id: number;
  slug: string;
  status: string;
  date_gmt: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  _embedded?: {
    "wp:featuredmedia"?: WPMedia[];
  };
}

interface BlogPayload {
  slug: string;
  title_en: string;
  title_zh: string;
  content_en: string;
  content_zh: string;
  excerpt_en: string;
  excerpt_zh: string;
  cover_image?: string | null;
  status: "draft" | "published" | "archived";
  published_at?: string | null;
}

function slugifyBase(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const usedSlugs = new Set<string>();

function normalizeSlug(originalSlug: string, title: string, id: number): string {
  let candidate = originalSlug || "";

  if (candidate) {
    try {
      candidate = decodeURIComponent(candidate);
    } catch (error) {
      // ignore decode errors and fall back later
    }
  }

  const asciiOnly = /^[\x00-\x7F]+$/;
  if (!candidate || !asciiOnly.test(candidate)) {
    candidate = slugifyBase(title);
  }

  if (!candidate) {
    candidate = `post-${id}`;
  }

  if (candidate.length > 100) {
    candidate = candidate.slice(0, 100).replace(/-+$/g, "");
  }

  // Ensure unique within this run
  let uniqueSlug = candidate;
  let suffix = 1;
  while (usedSlugs.has(uniqueSlug)) {
    uniqueSlug = `${candidate}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(uniqueSlug);
  return uniqueSlug;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function ensureDir(dirPath: string) {
  await fsp.mkdir(dirPath, { recursive: true });
}

async function fetchWpPosts(): Promise<WPPost[]> {
  if (WP_POSTS_FILE) {
    const filePath = path.isAbsolute(WP_POSTS_FILE)
      ? WP_POSTS_FILE
      : path.join(process.cwd(), WP_POSTS_FILE);

    if (!fs.existsSync(filePath)) {
      throw new Error(`WP_POSTS_FILE not found: ${filePath}`);
    }

    const fileContent = await fsp.readFile(filePath, "utf-8");
    const parsed = JSON.parse(fileContent);

    if (!Array.isArray(parsed)) {
      throw new Error("WP_POSTS_FILE must contain an array of posts");
    }

    console.log(`Loaded ${parsed.length} posts from ${filePath}`);
    return parsed as WPPost[];
  }

  const posts: WPPost[] = [];
  let page = 1;

  while (true) {
    const url = `${WP_BASE_URL}/wp-json/wp/v2/posts?_embed&per_page=${PAGE_SIZE}&page=${page}`;
    const res = await fetch(url);

    if (res.status === 400) {
      break;
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch WP posts: ${res.status} ${res.statusText}`);
    }

    const batch: WPPost[] = await res.json();
    if (batch.length === 0) {
      break;
    }

    posts.push(...batch);

    if (batch.length < PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  return posts;
}

function getImageCandidate($img: cheerio.Cheerio): string | null {
  const candidates = [
    $img.attr("data-src"),
    $img.attr("data-lazy-src"),
    $img.attr("src"),
  ];
  for (const candidate of candidates) {
    if (candidate && candidate.startsWith("http")) {
      return candidate;
    }
  }
  const srcset = $img.attr("data-srcset") || $img.attr("srcset");
  if (srcset) {
    const parts = srcset.split(",").map((part) => part.trim().split(" ")[0]);
    const first = parts.find((item) => item && item.startsWith("http"));
    if (first) {
      return first;
    }
  }
  return null;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

async function downloadImage(url: string, slug: string): Promise<string | null> {
  if (!url || !url.startsWith("http")) {
    return null;
  }
  if (downloadedImages.has(url)) {
    return downloadedImages.get(url) as string;
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    console.warn(`Invalid image URL skipped: ${url}`);
    return null;
  }
  const originalExt = path.extname(parsed.pathname).split("?")[0];
  const ext = originalExt && originalExt.length <= 5 ? originalExt : ".jpg";
  const base = path.basename(parsed.pathname, originalExt) || "image";
  const safeBase = sanitizeFileName(base) || "image";
  const hash = crypto.createHash("md5").update(url).digest("hex").slice(0, 8);
  const fileName = `${slug}-${safeBase}-${hash}${ext}`;
  const filePath = path.join(BLOG_IMAGE_DIR, fileName);
  const publicPath = `${BLOG_IMAGE_PUBLIC_PATH}/${fileName}`;
  try {
    await fsp.access(filePath, fsConstants.F_OK);
    downloadedImages.set(url, publicPath);
    return publicPath;
  } catch {
    /* file not found, continue */
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to download image ${url}: ${response.status}`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    await fsp.writeFile(filePath, Buffer.from(arrayBuffer));
    downloadedImages.set(url, publicPath);
    return publicPath;
  } catch (error) {
    console.warn(`Error downloading image ${url}:`, error);
    return null;
  }
}

async function sanitizeContent(html: string, slug: string): Promise<string> {
  if (!html) {
    return html;
  }
  const $ = cheerio.load(html);
  $("noscript").remove();
  const tasks: Promise<void>[] = [];
  $("img").each((_, element) => {
    tasks.push(
      (async () => {
        const $img = $(element);
        const remoteUrl = getImageCandidate($img);
        if (!remoteUrl) {
          $img.remove();
          return;
        }
        const localPath = await downloadImage(remoteUrl, slug);
        if (!localPath) {
          $img.remove();
          return;
        }
        $img.attr("src", localPath);
        $img.removeAttr("data-src");
        $img.removeAttr("data-lazy-src");
        $img.removeAttr("data-srcset");
        $img.removeAttr("srcset");
        $img.removeAttr("loading");
        $img.removeAttr("decoding");
      })()
    );
  });
  await Promise.all(tasks);
  return $.root()
    .children()
    .toArray()
    .map((el) => $.html(el))
    .join("");
}

async function createPost(payload: BlogPayload): Promise<void> {
  const res = await fetch(`${TARGET_BASE_URL}/api/blog`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      excerpt_en: payload.excerpt_en || payload.content_en.slice(0, 160),
      excerpt_zh: payload.excerpt_zh || payload.content_zh.slice(0, 160),
    }),
  });

  if (res.status === 409) {
    console.log(`Skipped existing post: ${payload.slug}`);
    return;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create post ${payload.slug}: ${res.status} ${text}`);
  }

  console.log(`Imported post: ${payload.slug}`);
}

async function mapPost(post: WPPost): Promise<BlogPayload> {
  const clamp = (text: string, max: number) => {
    if (text.length <= max) {
      return text;
    }
    return text.slice(0, max - 3) + "...";
  };

  const rawTitle = stripHtml(post.title?.rendered || "Untitled");
  const title = clamp(rawTitle, 500);
  const rawExcerpt = stripHtml(post.excerpt?.rendered || "");
  const fallbackExcerptSource = stripHtml(post.content?.rendered || "");
  const excerpt = clamp(rawExcerpt || fallbackExcerptSource || "", 1000);
  const content = post.content?.rendered || "";
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  const coverImage = media?.source_url || null;

  const slug = normalizeSlug(post.slug, title, post.id);
  const sanitizedContent = await sanitizeContent(content, slug);
  const localCover = coverImage ? await downloadImage(coverImage, slug) : null;

  return {
    slug,
    title_en: title,
    title_zh: title,
    content_en: sanitizedContent,
    content_zh: sanitizedContent,
    excerpt_en: excerpt,
    excerpt_zh: excerpt,
    cover_image: localCover,
    status: post.status === "publish" ? "published" : "draft",
    published_at: post.date_gmt ? new Date(post.date_gmt).toISOString() : null,
  };
}

async function main() {
  console.log(`Fetching posts from ${WP_BASE_URL} ...`);
  await ensureDir(BLOG_IMAGE_DIR);
  const posts = await fetchWpPosts();
  console.log(`Fetched ${posts.length} posts.`);

  for (const wpPost of posts) {
    const payload = await mapPost(wpPost);
    try {
      await createPost(payload);
    } catch (error) {
      console.error(`Failed to import ${payload.slug}:`, error);
    }
  }

  console.log("Import completed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
