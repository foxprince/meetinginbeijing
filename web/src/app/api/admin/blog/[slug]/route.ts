import { NextRequest, NextResponse } from 'next/server';
import { getDbClient } from '@/lib/db';

const ADMIN_SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE || 'admin_session';
const ADMIN_SESSION_TOKEN = process.env.ADMIN_SESSION_TOKEN || 'admin_session_token';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

    if (session !== ADMIN_SESSION_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await getDbClient();
    const result = await client.query<Record<string, unknown>>(
      `SELECT
        id,
        slug,
        title_en,
        title_zh,
        content_en,
        content_zh,
        excerpt_en,
        excerpt_zh,
        cover_image,
        status,
        author,
        published_at,
        created_at,
        updated_at
      FROM blog_posts
      WHERE slug = $1
      LIMIT 1`,
      [slug]
    );
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to fetch admin blog post:', error);
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
  }
}
