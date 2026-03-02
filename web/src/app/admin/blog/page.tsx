'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Eye, Search, Calendar, ImageIcon, Upload } from 'lucide-react';
import { BlogPost, CreateBlogPostRequest } from '@/types/blog';

interface BlogListItem {
  id: number;
  slug: string;
  title_en: string;
  title_zh: string;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  created_at: string;
  author: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [activeTextarea, setActiveTextarea] = useState<'en' | 'zh'>('en');
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageAlt, setImageAlt] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const enTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const zhTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  // 表单状态
  const [formData, setFormData] = useState<CreateBlogPostRequest>({
    slug: '',
    title_en: '',
    title_zh: '',
    content_en: '',
    content_zh: '',
    excerpt_en: '',
    excerpt_zh: '',
    cover_image: '',
    status: 'draft',
  });

  // 加载博客列表
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/blog?status=all&pageSize=100');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const openImageDialog = (lang: 'en' | 'zh') => {
    setActiveTextarea(lang);
    setSelectedFile(null);
    setImageAlt('');
    setUploadError('');
    setIsImageDialogOpen(true);
  };

  const handleImageDialogChange = (open: boolean) => {
    setIsImageDialogOpen(open);
    if (!open) {
      setSelectedFile(null);
      setImageAlt('');
      setUploadError('');
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      setUploadError('请先选择图片文件');
      return;
    }

    const formDataPayload = new FormData();
    formDataPayload.append('file', selectedFile);
    if (imageAlt) {
      formDataPayload.append('alt', imageAlt);
    }

    try {
      setUploadingImage(true);
      setUploadError('');
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataPayload,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || '图片上传失败');
      }

      const data = await res.json();
      handleImageInsert(data.url, imageAlt || selectedFile.name);
      setIsImageDialogOpen(false);
      setSelectedFile(null);
      setImageAlt('');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '图片上传失败');
    } finally {
      setUploadingImage(false);
    }
  };

  // 创建博客文章
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsCreateDialogOpen(false);
        resetForm();
        fetchPosts();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post');
    }
  };

  // 更新博客文章
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    try {
      const res = await fetch(`/api/blog/${editingPost.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setEditingPost(null);
        resetForm();
        fetchPosts();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update post');
      }
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post');
    }
  };

  // 删除博客文章
  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`/api/blog/${slug}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchPosts();
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  // 获取单篇博客详情（用于编辑）
  const fetchPostDetail = async (slug: string) => {
    try {
      const res = await fetch(`/api/admin/blog/${slug}`);
      if (res.ok) {
        const post = await res.json();
        setEditingPost(post);
        setFormData({
          slug: post.slug || '',
          title_en: post.title_en || '',
          title_zh: post.title_zh || '',
          content_en: post.content_en || '',
          content_zh: post.content_zh || '',
          excerpt_en: post.excerpt_en || '',
          excerpt_zh: post.excerpt_zh || '',
          cover_image: post.cover_image || '',
          status: post.status,
        });
      } else {
        const error = await res.json().catch(() => ({}));
        console.error('Failed to fetch admin post detail', error);
      }
    } catch (error) {
      console.error('Failed to fetch post detail:', error);
    }
  };

  const handleImageInsert = (url: string, alt: string) => {
    const textarea = activeTextarea === 'en' ? enTextareaRef.current : zhTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const text = textarea.value;
    const imageTag = `\n<img src="${url}" alt="${alt}" class="w-full rounded-xl my-4" />\n`;

    const newText = text.substring(0, start) + imageTag + text.substring(start);

    if (activeTextarea === 'en') {
      setFormData((prev) => ({ ...prev, content_en: newText }));
    } else {
      setFormData((prev) => ({ ...prev, content_zh: newText }));
    }
  };

  const resetForm = () => {
    setFormData({
      slug: '',
      title_en: '',
      title_zh: '',
      content_en: '',
      content_zh: '',
      excerpt_en: '',
      excerpt_zh: '',
      cover_image: '',
      status: 'draft',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-slate-100 text-slate-700',
      published: 'bg-green-100 text-green-700',
      archived: 'bg-gray-100 text-gray-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.title_zh.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-slate-900">
              MeetingInBeijing
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600">Admin</span>
            <span className="text-slate-400">/</span>
            <span className="font-medium text-slate-900">Blog</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/blog">
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Blog
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <Search className="w-5 h-5 text-slate-400 absolute ml-3" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Blog Post</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new blog post.
                </DialogDescription>
              </DialogHeader>
              <BlogForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreate}
                onCancel={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
                enTextareaRef={enTextareaRef}
                zhTextareaRef={zhTextareaRef}
                onImageClick={openImageDialog}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title (EN)</TableHead>
                <TableHead>Title (ZH)</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No posts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {post.title_en}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{post.title_zh}</TableCell>
                    <TableCell className="text-slate-500 max-w-[180px] truncate">
                      {post.slug}
                    </TableCell>
                    <TableCell>{getStatusBadge(post.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-slate-500 text-sm">
                        <Calendar className="w-4 h-4" />
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString()
                          : 'Draft'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/blog/${post.slug}`} target="_blank">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fetchPostDetail(post.slug)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(post.slug)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Blog Post</DialogTitle>
              <DialogDescription>Update the blog post details below.</DialogDescription>
            </DialogHeader>
            {editingPost && (
              <BlogForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleUpdate}
                onCancel={() => {
                  setEditingPost(null);
                  resetForm();
                }}
                isEditing
                enTextareaRef={enTextareaRef}
                zhTextareaRef={zhTextareaRef}
                onImageClick={openImageDialog}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Image Upload Dialog */}
        <Dialog open={isImageDialogOpen} onOpenChange={handleImageDialogChange}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>上传图片</DialogTitle>
              <DialogDescription>图片将上传到阿里云 OSS，并自动插入到当前内容中。</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-file">选择图片文件</Label>
                <Input
                  id="image-file"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setSelectedFile(file);
                    setUploadError('');
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-alt">图片描述（可选）</Label>
                <Input
                  id="image-alt"
                  value={imageAlt}
                  onChange={(event) => setImageAlt(event.target.value)}
                  placeholder="用于图片 alt 文本"
                />
              </div>
              {selectedFile && (
                <p className="text-sm text-slate-500">已选择：{selectedFile.name}</p>
              )}
              {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => handleImageDialogChange(false)}>
                  取消
                </Button>
                <Button type="button" onClick={handleImageUpload} disabled={uploadingImage}>
                  {uploadingImage ? '上传中...' : '上传并插入'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

// 博客表单组件
interface BlogFormProps {
  formData: CreateBlogPostRequest;
  setFormData: (data: CreateBlogPostRequest) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing?: boolean;
  enTextareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  zhTextareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  onImageClick?: (lang: 'en' | 'zh') => void;
}

function BlogForm({ formData, setFormData, onSubmit, onCancel, isEditing, enTextareaRef, zhTextareaRef, onImageClick }: BlogFormProps) {
  // 辅助函数：在textarea中插入标签
  const insertTag = (openTag: string, closeTag: string, lang: 'en' | 'zh') => {
    const textarea = lang === 'en' ? enTextareaRef?.current : zhTextareaRef?.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    const newText = before + openTag + selected + closeTag + after;
    
    if (lang === 'en') {
      setFormData({ ...formData, content_en: newText });
    } else {
      setFormData({ ...formData, content_zh: newText });
    }

    // 恢复焦点并设置光标位置
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + openTag.length + selected.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 py-4">
      {/* Slug */}
      {!isEditing && (
        <div className="space-y-2">
          <Label htmlFor="slug">
            Slug <span className="text-red-500">*</span>
          </Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="my-blog-post"
            required={!isEditing}
          />
          <p className="text-sm text-slate-500">
            URL-friendly identifier. Auto-generated from title if left empty.
          </p>
        </div>
      )}

      {/* English Title */}
      <div className="space-y-2">
        <Label htmlFor="title_en">
          English Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title_en"
          value={formData.title_en}
          onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
          placeholder="Enter English title"
          required
        />
      </div>

      {/* Chinese Title */}
      <div className="space-y-2">
        <Label htmlFor="title_zh">
          Chinese Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title_zh"
          value={formData.title_zh}
          onChange={(e) => setFormData({ ...formData, title_zh: e.target.value })}
          placeholder="输入中文标题"
          required
        />
      </div>

      {/* Cover Image */}
      <div className="space-y-2">
        <Label htmlFor="cover_image">Cover Image URL</Label>
        <Input
          id="cover_image"
          value={formData.cover_image}
          onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* English Excerpt */}
      <div className="space-y-2">
        <Label htmlFor="excerpt_en">English Excerpt</Label>
        <Textarea
          id="excerpt_en"
          value={formData.excerpt_en}
          onChange={(e) => setFormData({ ...formData, excerpt_en: e.target.value })}
          placeholder="Brief summary in English..."
          rows={2}
        />
      </div>

      {/* Chinese Excerpt */}
      <div className="space-y-2">
        <Label htmlFor="excerpt_zh">Chinese Excerpt</Label>
        <Textarea
          id="excerpt_zh"
          value={formData.excerpt_zh}
          onChange={(e) => setFormData({ ...formData, excerpt_zh: e.target.value })}
          placeholder="中文简要概述..."
          rows={2}
        />
      </div>

      {/* English Content with Rich Text Toolbar */}
      <div className="space-y-2">
        <Label htmlFor="content_en">
          English Content <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center gap-1 p-2 bg-slate-100 rounded-lg mb-2 flex-wrap">
          <button type="button" onClick={() => insertTag('<strong>', '</strong>', 'en')} className="px-2 py-1 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all" title="Bold">B</button>
          <button type="button" onClick={() => insertTag('<em>', '</em>', 'en')} className="px-2 py-1 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all" title="Italic">I</button>
          <button type="button" onClick={() => insertTag('<h2>', '</h2>', 'en')} className="px-2 py-1 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all" title="Heading 2">H2</button>
          <button type="button" onClick={() => insertTag('<h3>', '</h3>', 'en')} className="px-2 py-1 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all" title="Heading 3">H3</button>
          <button type="button" onClick={() => insertTag('<p>', '</p>', 'en')} className="px-2 py-1 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all" title="Paragraph">P</button>
          <button type="button" onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>', 'en')} className="px-2 py-1 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all" title="Unordered List">UL</button>
          <button type="button" onClick={() => insertTag('<ol>\n  <li>', '</li>\n</ol>', 'en')} className="px-2 py-1 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all" title="Ordered List">OL</button>
          <button type="button" onClick={() => insertTag('<a href="">', '</a>', 'en')} className="px-2 py-1 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all" title="Link">Link</button>
          <div className="w-px h-6 bg-slate-300 mx-1" />
          <button type="button" onClick={() => onImageClick?.('en')} className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all" title="Insert Image">
            <ImageIcon className="w-4 h-4" />
            Image
          </button>
        </div>
        <Textarea
          id="content_en"
          ref={enTextareaRef}
          value={formData.content_en}
          onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
          placeholder="Write your blog content in English... (HTML supported)"
          rows={12}
          required
        />
        <p className="text-sm text-slate-500">HTML tags are supported for formatting.</p>
      </div>

      {/* Chinese Content with Rich Text Toolbar */}
      <div className="space-y-2">
        <Label htmlFor="content_zh">
          Chinese Content <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center gap-1 p-2 bg-slate-100 rounded-lg mb-2 flex-wrap">
          <button type="button" onClick={() => insertTag('<strong>', '</strong>', 'zh')} className="px-2 py-1 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all" title="Bold">B</button>
          <button type="button" onClick={() => insertTag('<em>', '</em>', 'zh')} className="px-2 py-1 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all" title="Italic">I</button>
          <button type="button" onClick={() => insertTag('<h2>', '</h2>', 'zh')} className="px-2 py-1 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all" title="Heading 2">H2</button>
          <button type="button" onClick={() => insertTag('<h3>', '</h3>', 'zh')} className="px-2 py-1 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all" title="Heading 3">H3</button>
          <button type="button" onClick={() => insertTag('<p>', '</p>', 'zh')} className="px-2 py-1 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all" title="Paragraph">P</button>
          <button type="button" onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>', 'zh')} className="px-2 py-1 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all" title="Unordered List">UL</button>
          <button type="button" onClick={() => insertTag('<ol>\n  <li>', '</li>\n</ol>', 'zh')} className="px-2 py-1 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all" title="Ordered List">OL</button>
          <button type="button" onClick={() => insertTag('<a href="">', '</a>', 'zh')} className="px-2 py-1 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all" title="Link">Link</button>
          <div className="w-px h-6 bg-slate-300 mx-1" />
          <button type="button" onClick={() => onImageClick?.('zh')} className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all" title="Insert Image">
            <ImageIcon className="w-4 h-4" />
            Image
          </button>
        </div>
        <Textarea
          id="content_zh"
          ref={zhTextareaRef}
          value={formData.content_zh}
          onChange={(e) => setFormData({ ...formData, content_zh: e.target.value })}
          placeholder="撰写中文博客内容...（支持 HTML）"
          rows={12}
          required
        />
        <p className="text-sm text-slate-500">支持 HTML 标签进行排版。</p>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) =>
            setFormData({ ...formData, status: value as 'draft' | 'published' | 'archived' })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{isEditing ? 'Update Post' : 'Create Post'}</Button>
      </div>
    </form>
  );
}
