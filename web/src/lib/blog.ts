import { getDbClient } from '@/lib/db';

export type BlogLang = 'en' | 'zh';

export type BlogPostStatus = 'draft' | 'published' | 'archived' | 'all';

export interface BlogListItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string | null;
  author: string;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogListResult {
  posts: BlogListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BlogPostDetail {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  cover_image: string | null;
  author: string;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  meta_title: string | null;
  meta_description: string | null;
}

function resolveLang(value: string): BlogLang {
  return value === 'zh' ? 'zh' : 'en';
}

export async function fetch_blog_posts(params?: {
  page?: number;
  page_size?: number;
  status?: BlogPostStatus;
  lang?: string;
}): Promise<BlogListResult> {
  const page = params?.page && params.page >= 1 ? params.page : 1;
  const pageSize =
    params?.page_size && params.page_size >= 1 ? params.page_size : 10;
  const status = params?.status ?? 'published';
  const lang = resolveLang(params?.lang ?? 'en');

  const offset = (page - 1) * pageSize;
  const client = await getDbClient();

  try {
    if (status === 'all') {
      const postsResult = await client.query<{
        id: number;
        slug: string;
        title_en: string;
        title_zh: string;
        excerpt_en: string | null;
        excerpt_zh: string | null;
        cover_image: string | null;
        author: string;
        status: string;
        published_at: string | null;
        created_at: string;
        updated_at: string;
      }>(
        `SELECT 
          id,
          slug,
          title_en,
          title_zh,
          excerpt_en,
          excerpt_zh,
          cover_image,
          author,
          status,
          published_at,
          created_at,
          updated_at
        FROM blog_posts
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      );

      const countResult = await client.query<{ total: string }>(
        'SELECT COUNT(*) as total FROM blog_posts'
      );

      const total = parseInt(countResult.rows[0]?.total ?? '0', 10);
      const totalPages = Math.ceil(total / pageSize);

      const posts: BlogListItem[] = postsResult.rows.map(
        (row: (typeof postsResult.rows)[number]) => {
        const title = lang === 'zh' ? row.title_zh : row.title_en;
        const excerpt =
          (lang === 'zh' ? row.excerpt_zh : row.excerpt_en) ?? '';

        return {
          id: row.id,
          slug: row.slug,
          title,
          excerpt,
          cover_image: row.cover_image,
          author: row.author,
          status: row.status,
          published_at: row.published_at,
          created_at: row.created_at,
          updated_at: row.updated_at,
        };
        }
      );

      return {
        posts,
        total,
        page,
        pageSize,
        totalPages,
      };
    }

    const titleColumn = lang === 'zh' ? 'title_zh' : 'title_en';
    const excerptColumn = lang === 'zh' ? 'excerpt_zh' : 'excerpt_en';

    const postsResult = await client.query<BlogListItem>(
      `SELECT 
        id,
        slug,
        ${titleColumn} as title,
        COALESCE(${excerptColumn}, '') as excerpt,
        cover_image,
        author,
        status,
        published_at,
        created_at,
        updated_at
      FROM blog_posts
      WHERE status = $1
      ORDER BY published_at DESC NULLS LAST, created_at DESC
      LIMIT $2 OFFSET $3`,
      [status, pageSize, offset]
    );

    const countResult = await client.query<{ total: string }>(
      'SELECT COUNT(*) as total FROM blog_posts WHERE status = $1',
      [status]
    );

    const total = parseInt(countResult.rows[0]?.total ?? '0', 10);
    const totalPages = Math.ceil(total / pageSize);

    return {
      posts: postsResult.rows,
      total,
      page,
      pageSize,
      totalPages,
    };
  } finally {
    client.release();
  }
}

export async function fetch_blog_post_by_slug(params: {
  slug: string;
  lang?: string;
  include_draft?: boolean;
}): Promise<BlogPostDetail | null> {
  const slug = params.slug;
  const lang = resolveLang(params.lang ?? 'en');
  const includeDraft = params.include_draft === true;

  const client = await getDbClient();

  try {
    const tableSuffix = lang === 'zh' ? 'zh' : 'en';

    const baseQuery = `
        SELECT 
          id,
          slug,
          title_${tableSuffix} as title,
          content_${tableSuffix} as content,
          COALESCE(excerpt_${tableSuffix}, '') as excerpt,
          cover_image,
          author,
          status,
          published_at,
          created_at,
          updated_at,
          meta_title_${tableSuffix} as meta_title,
          meta_description_${tableSuffix} as meta_description
        FROM blog_posts
        WHERE slug = $1`;

    const queryText = includeDraft
      ? baseQuery
      : `${baseQuery} AND status = 'published'`;

    const result = await client.query<BlogPostDetail>(queryText, [slug]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } finally {
    client.release();
  }
}
