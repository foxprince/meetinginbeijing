// 博客文章类型定义
export interface BlogPost {
  id: number;
  slug: string;
  title_en: string;
  title_zh: string;
  content_en: string;
  content_zh: string;
  excerpt_en?: string;
  excerpt_zh?: string;
  cover_image?: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  created_at: string;
  updated_at: string;
  meta_title_en?: string;
  meta_title_zh?: string;
  meta_description_en?: string;
  meta_description_zh?: string;
}

// 创建博客文章请求类型
export interface CreateBlogPostRequest {
  slug: string;
  title_en: string;
  title_zh: string;
  content_en: string;
  content_zh: string;
  excerpt_en?: string;
  excerpt_zh?: string;
  cover_image?: string;
  status?: 'draft' | 'published' | 'archived';
  published_at?: string;
  meta_title_en?: string;
  meta_title_zh?: string;
  meta_description_en?: string;
  meta_description_zh?: string;
}

// 更新博客文章请求类型
export interface UpdateBlogPostRequest {
  title_en?: string;
  title_zh?: string;
  content_en?: string;
  content_zh?: string;
  excerpt_en?: string;
  excerpt_zh?: string;
  cover_image?: string;
  status?: 'draft' | 'published' | 'archived';
  published_at?: string;
  meta_title_en?: string;
  meta_title_zh?: string;
  meta_description_en?: string;
  meta_description_zh?: string;
}

// 博客列表响应类型
export interface BlogListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 生成 slug 的辅助函数
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100);
}
