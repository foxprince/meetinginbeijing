import { Pool } from 'pg';

let connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL is not set');
}

// 解码连接字符串中的 URL 编码字符（如 %26 -> &）
try {
  const url = new URL(connectionString);
  connectionString = url.toString();
} catch (error) {
  console.warn('Failed to parse connection string as URL, using as-is');
}

// 允许自签名证书连接数据库
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

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

  // 创建索引
  await client.query('CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);');
  await client.query('CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);');
  await client.query('CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);');

  client.release();
  console.log('Database initialized successfully');
}
