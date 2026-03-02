import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// POST /api/upload - 上传图片
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // 验证文件大小 (最大 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // 生成文件名
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    const randomString = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${randomString}.${extension}`;

    // 确保上传目录存在
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blog');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 保存文件
    const filepath = path.join(uploadDir, filename);
    const bytes_array = new Uint8Array(await file.arrayBuffer());
    await writeFile(filepath, bytes_array);

    // 返回文件URL
    const fileUrl = `/uploads/blog/${filename}`;

    return NextResponse.json({
      url: fileUrl,
      filename: filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
