import { NextRequest, NextResponse } from 'next/server';
import { getDbClient } from '@/lib/db';
import { CreateBlogPostRequest, generateSlug } from '@/types/blog';

// GET /api/blog - 获取博客列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const status = searchParams.get('status') || 'published';
    const lang = searchParams.get('lang') || 'en';

    const offset = (page - 1) * pageSize;

    const client = await getDbClient();

    // 获取文章列表 - 如果 status 为 'all'，则不限制状态
    let postsResult;
    let countResult;

    if (status === 'all') {
      postsResult = await client.query(
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

      countResult = await client.query('SELECT COUNT(*) as total FROM blog_posts');
    } else {
      const titleColumn = lang === 'zh' ? 'title_zh' : 'title_en';
      const excerptColumn = lang === 'zh' ? 'excerpt_zh' : 'excerpt_en';

      postsResult = await client.query(
        `SELECT 
          id,
          slug,
          ${titleColumn} as title,
          ${excerptColumn} as excerpt,
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

      countResult = await client.query('SELECT COUNT(*) as total FROM blog_posts WHERE status = $1', [status]);
    }

    client.release();

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      posts: postsResult.rows,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// POST /api/blog - 创建博客文章
export async function POST(request: NextRequest) {
  try {
    const body: CreateBlogPostRequest = await request.json();

    // 验证必填字段
    if (!body.title_en || !body.title_zh || !body.content_en || !body.content_zh) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 生成 slug
    const slug = body.slug || generateSlug(body.title_en);

    const client = await getDbClient();

    // 检查 slug 是否已存在
    const existingResult = await client.query('SELECT id FROM blog_posts WHERE slug = $1', [slug]);

    if (existingResult.rows.length > 0) {
      client.release();
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      );
    }

    // 处理 published_at 日期
    const publishedAtValue = body.published_at 
      ? new Date(body.published_at).toISOString()
      : body.status === 'published' 
        ? new Date().toISOString() 
        : null;

    // 插入新文章
    const result = await client.query(
      `INSERT INTO blog_posts (
        slug,
        title_en,
        title_zh,
        content_en,
        content_zh,
        excerpt_en,
        excerpt_zh,
        cover_image,
        status,
        published_at,
        meta_title_en,
        meta_title_zh,
        meta_description_en,
        meta_description_zh
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14
      )
      RETURNING *`,
      [
        slug,
        body.title_en,
        body.title_zh,
        body.content_en,
        body.content_zh,
        body.excerpt_en || null,
        body.excerpt_zh || null,
        body.cover_image || null,
        body.status || 'draft',
        publishedAtValue,
        body.meta_title_en || null,
        body.meta_title_zh || null,
        body.meta_description_en || null,
        body.meta_description_zh || null,
      ]
    );

    client.release();

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    const details =
      error instanceof Error
        ? error.message
        : (() => {
            try {
              return JSON.stringify(error);
            } catch (serializationError) {
              return String(error);
            }
          })();

    return NextResponse.json(
      {
        error: 'Failed to create blog post',
        details,
      },
      { status: 500 }
    );
  }
}
