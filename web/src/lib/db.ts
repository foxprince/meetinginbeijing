import { Pool } from 'pg';
import type { PoolConfig } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// 在生产环境中，从 .env 文件手动加载环境变量
if (process.env.NODE_ENV === 'production' && !process.env.POSTGRES_URL) {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const lines = envContent.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          const value = valueParts.join('=');
          if (key && value) {
            process.env[key] = value;
          }
        }
      }
    }
  } catch (error) {
    console.warn('Failed to load .env file:', error);
  }
}

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL is not set');
}

// 允许自签名证书连接数据库
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// 解析连接字符串，正确处理 URL 编码的密码
let poolConfig: PoolConfig = {
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
};

try {
  const url = new URL(connectionString);
  // 如果密码包含 URL 编码字符，需要解码
  if (url.password && url.password.includes('%')) {
    const decodedPassword = decodeURIComponent(url.password);
    // 使用分离的配置而不是连接字符串，避免 pg 库的 URL 解析问题
    poolConfig = {
      host: url.hostname,
      port: parseInt(url.port || '5432'),
      database: url.pathname.slice(1),
      user: url.username,
      password: decodedPassword,
      ssl: {
        rejectUnauthorized: false,
      },
    };
  }
} catch (error) {
  console.warn('Failed to parse connection string, using as-is', error);
}

const pool = new Pool(poolConfig);

export const getDbPool = () => pool;

export async function getDbClient() {
  return pool.connect();
}

// 初始化数据库表
export async function initDb() {
  const client = await getDbClient();

  // 创建博客文章表
  await client.query(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      title_en VARCHAR(500) NOT NULL,
      title_zh VARCHAR(500) NOT NULL,
      content_en TEXT NOT NULL,
      content_zh TEXT NOT NULL,
      excerpt_en VARCHAR(1000),
      excerpt_zh VARCHAR(1000),
      cover_image VARCHAR(500),
      author VARCHAR(100) DEFAULT 'Jane',
      status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
      published_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      meta_title_en VARCHAR(500),
      meta_title_zh VARCHAR(500),
      meta_description_en VARCHAR(1000),
      meta_description_zh VARCHAR(1000)
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS cms_sections (
      section_key VARCHAR(100) PRIMARY KEY,
      draft_content_en JSONB NOT NULL DEFAULT '{}'::jsonb,
      draft_content_zh JSONB NOT NULL DEFAULT '{}'::jsonb,
      published_content_en JSONB NOT NULL DEFAULT '{}'::jsonb,
      published_content_zh JSONB NOT NULL DEFAULT '{}'::jsonb,
      status VARCHAR(20) NOT NULL DEFAULT 'draft',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      published_at TIMESTAMP WITH TIME ZONE
    );
  `);

  // 创建索引
  await client.query('CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);');
  await client.query('CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);');
  await client.query('CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);');
  await client.query('CREATE INDEX IF NOT EXISTS idx_cms_sections_status ON cms_sections(status);');

  client.release();
  console.log('Database initialized successfully');
}
