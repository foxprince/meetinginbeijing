import { NextRequest, NextResponse } from 'next/server';
import { fetch_blog_post_by_slug } from '@/lib/blog';
import { getDbClient } from '@/lib/db';
import { UpdateBlogPostRequest } from '@/types/blog';

// GET /api/blog/[slug] - 获取单篇博客文章
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    const includeDraft = searchParams.get('includeDraft') === 'true';

    const post = await fetch_blog_post_by_slug({
      slug,
      lang,
      include_draft: includeDraft,
    });

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PUT /api/blog/[slug] - 更新博客文章
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body: UpdateBlogPostRequest = await request.json();

    const client = await getDbClient();

    // 检查文章是否存在
    const existingResult = await client.query<{
      id: number;
      status: string;
      published_at: string | null;
    }>('SELECT id, status, published_at FROM blog_posts WHERE slug = $1', [slug]);

    if (existingResult.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    const currentPost = existingResult.rows[0];

    // 处理 published_at
    let publishedAtValue = currentPost.published_at;
    if (body.status === 'published' && currentPost.status !== 'published') {
      publishedAtValue = new Date().toISOString();
    } else if (body.published_at) {
      publishedAtValue = new Date(body.published_at).toISOString();
    }

    // 构建更新查询
    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (body.title_en !== undefined) {
      updates.push('title_en = $' + (values.length + 1));
      values.push(body.title_en);
    }
    if (body.title_zh !== undefined) {
      updates.push('title_zh = $' + (values.length + 1));
      values.push(body.title_zh);
    }
    if (body.content_en !== undefined) {
      updates.push('content_en = $' + (values.length + 1));
      values.push(body.content_en);
    }
    if (body.content_zh !== undefined) {
      updates.push('content_zh = $' + (values.length + 1));
      values.push(body.content_zh);
    }
    if (body.excerpt_en !== undefined) {
      updates.push('excerpt_en = $' + (values.length + 1));
      values.push(body.excerpt_en);
    }
    if (body.excerpt_zh !== undefined) {
      updates.push('excerpt_zh = $' + (values.length + 1));
      values.push(body.excerpt_zh);
    }
    if (body.cover_image !== undefined) {
      updates.push('cover_image = $' + (values.length + 1));
      values.push(body.cover_image);
    }
    if (body.status !== undefined) {
      updates.push('status = $' + (values.length + 1));
      values.push(body.status);
    }
    if (publishedAtValue !== undefined) {
      updates.push('published_at = $' + (values.length + 1));
      values.push(publishedAtValue);
    }
    if (body.meta_title_en !== undefined) {
      updates.push('meta_title_en = $' + (values.length + 1));
      values.push(body.meta_title_en);
    }
    if (body.meta_title_zh !== undefined) {
      updates.push('meta_title_zh = $' + (values.length + 1));
      values.push(body.meta_title_zh);
    }
    if (body.meta_description_en !== undefined) {
      updates.push('meta_description_en = $' + (values.length + 1));
      values.push(body.meta_description_en);
    }
    if (body.meta_description_zh !== undefined) {
      updates.push('meta_description_zh = $' + (values.length + 1));
      values.push(body.meta_description_zh);
    }

    // 添加 updated_at
    updates.push('updated_at = CURRENT_TIMESTAMP');

    // 添加 slug 作为 WHERE 条件
    values.push(slug);

    const query = `
      UPDATE blog_posts 
      SET ${updates.join(', ')} 
      WHERE slug = $${values.length}
      RETURNING *
    `;

    const result = await client.query<Record<string, unknown>>(query, values);
    client.release();

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE /api/blog/[slug] - 删除博客文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const client = await getDbClient();

    const result = await client.query<{ id: number }>(
      'DELETE FROM blog_posts WHERE slug = $1 RETURNING id',
      [slug]
    );
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
