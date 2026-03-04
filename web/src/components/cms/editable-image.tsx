'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminSession } from '@/hooks/use-admin-session';
import { isOssPublicImageUrl } from '@/lib/image';
import Image from 'next/image';

interface EditableImageProps {
  currentImageUrl?: string;
  onSave: (newImageUrl: string) => Promise<void>;
  alt?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
}

export function EditableImage({
  currentImageUrl,
  onSave,
  alt = 'Image',
  className = '',
  aspectRatio = 'square',
}: EditableImageProps) {
  const isAdmin = useAdminSession();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过 5MB');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('上传失败');
      }

      const data = await res.json();
      setPreviewUrl(data.url);
      await onSave(data.url);
    } catch (err) {
      console.error('上传失败:', err);
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = previewUrl || currentImageUrl;

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
  };

  if (!isAdmin) {
    if (!displayUrl) {
      return (
        <div className={`${aspectClasses[aspectRatio]} bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 ${className}`}>
          [ {alt} ]
        </div>
      );
    }
    return (
      <div className={`${aspectClasses[aspectRatio]} relative rounded-3xl overflow-hidden ${className}`}>
        <Image
          src={displayUrl}
          alt={alt}
          fill
          unoptimized={isOssPublicImageUrl(displayUrl)}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`group relative ${aspectClasses[aspectRatio]} ${className}`}>
      {displayUrl ? (
        <div className="relative w-full h-full rounded-3xl overflow-hidden">
          <Image
            src={displayUrl}
            alt={alt}
            fill
            unoptimized={isOssPublicImageUrl(displayUrl)}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={uploading}
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? '上传中...' : '更换图片'}
                </span>
              </Button>
            </label>
          </div>
        </div>
      ) : (
        <label className="w-full h-full bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 hover:border-primary transition-colors flex flex-col items-center justify-center cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <Upload className="w-12 h-12 text-slate-400 mb-4" />
          <p className="text-slate-600 font-medium">
            {uploading ? '上传中...' : '点击上传图片'}
          </p>
          <p className="text-sm text-slate-400 mt-2">支持 JPG、PNG、GIF，最大 5MB</p>
        </label>
      )}
      {error && (
        <div className="absolute bottom-2 left-2 right-2 bg-red-500 text-white text-sm px-3 py-2 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
