import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/sections/footer-faq-cta';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, User } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | MeetingInBeijing',
  description: 'Insights, tips, and stories about living and doing business in Beijing.',
};

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string | null;
  author: string;
  published_at: string;
  created_at: string;
}

interface BlogListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

async function getBlogPosts(lang: string = 'en'): Promise<BlogListResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/blog?lang=${lang}&status=published&page=1&pageSize=12`, {
    next: { revalidate: 60 }, // 每分钟重新验证
  });

  if (!res.ok) {
    throw new Error('Failed to fetch blog posts');
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

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang = 'en' } = await searchParams;
  const data = await getBlogPosts(lang);
  const posts = data.posts || [];

  const isZh = lang === 'zh';

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-secondary/30">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            {isZh ? '博客' : 'Blog'}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {isZh
              ? '关于北京生活、商务和文化的实用见解、贴士和故事。'
              : 'Practical insights, tips, and stories about living, working, and doing business in Beijing.'}
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500 text-lg">
                {isZh ? '暂无博客文章，敬请期待！' : 'No blog posts yet. Check back soon!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-100"
                >
                  <Link href={`/blog/${post.slug}?lang=${lang}`}>
                    <div className="relative h-48 overflow-hidden">
                      {post.cover_image ? (
                        <Image
                          src={post.cover_image}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <span className="text-4xl">📝</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(post.published_at || post.created_at, lang)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {post.author}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                        {post.excerpt || (isZh ? '点击阅读更多...' : 'Click to read more...')}
                      </p>
                      <div className="flex items-center text-primary font-medium text-sm">
                        {isZh ? '阅读更多' : 'Read more'}
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}

          {/* Pagination placeholder - can be implemented later */}
          {data.totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {Array.from({ length: data.totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={i + 1 === data.page ? 'default' : 'outline'}
                  size="sm"
                  className={i + 1 === data.page ? 'bg-primary' : ''}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
