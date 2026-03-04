import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/sections/footer-faq-cta';
import { Button } from '@/components/ui/button';
import { isOssPublicImageUrl } from '@/lib/image';
import { Calendar, ArrowLeft, User, Share2 } from 'lucide-react';

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  cover_image: string | null;
  author: string;
  published_at: string;
  created_at: string;
  meta_title?: string;
  meta_description?: string;
}

async function getBlogPost(slug: string, lang: string = 'en'): Promise<BlogPost | null> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.INTERNAL_BASE_URL ||
    'http://127.0.0.1:3003';
  const res = await fetch(`${baseUrl}/api/blog/${slug}?lang=${lang}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch blog post');
  }

  return res.json();
}

function formatDate(dateString: string, lang: string = 'en'): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', options);
}

// 简单的 HTML 内容渲染（支持富文本）
function renderContent(content: string) {
  return (
    <div
      className="prose prose-slate max-w-none
        prose-headings:text-slate-900 prose-headings:font-bold
        prose-p:text-slate-600 prose-p:leading-relaxed
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-strong:text-slate-900
        prose-img:rounded-xl prose-img:shadow-lg
        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-secondary/30 prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:italic
        prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6
        prose-li:text-slate-600"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { lang = 'en' } = await searchParams;
  const post = await getBlogPost(slug, lang);

  if (!post) {
    return {
      title: 'Not Found | MeetingInBeijing',
    };
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover_image ? [post.cover_image] : [],
    },
  };
}

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const { lang = 'en' } = await searchParams;
  const post = await getBlogPost(slug, lang);

  if (!post) {
    notFound();
  }

  const isZh = lang === 'zh';

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 pt-8">
        <Link href={`/blog?lang=${lang}`}>
          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isZh ? '返回博客列表' : 'Back to Blog'}
          </Button>
        </Link>
      </div>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-6 md:px-12 py-8">
        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(post.published_at || post.created_at, lang)}
          </span>
          <span className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {post.author}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-10 shadow-lg">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              unoptimized={isOssPublicImageUrl(post.cover_image)}
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="py-6">
          {renderContent(post.content)}
        </div>

        {/* Share Section */}
        <div className="mt-12 pt-8 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">
                {isZh ? '分享这篇文章：' : 'Share this article:'}
              </span>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                {isZh ? '分享' : 'Share'}
              </Button>
            </div>
            <Link href={`/blog?lang=${lang}`}>
              <Button variant="ghost" size="sm">
                {isZh ? '更多文章' : 'More articles'}
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
