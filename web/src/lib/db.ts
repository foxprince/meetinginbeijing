import { Pool } from 'pg';

let connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL is not set');
}

// 允许自签名证书连接数据库
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// 解析连接字符串，正确处理 URL 编码的密码
let poolConfig: any = {
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
  console.warn('Failed to parse connection string, using as-is');
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

  // 创建索引
  await client.query('CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);');
  await client.query('CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);');
  await client.query('CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);');

  client.release();
  console.log('Database initialized successfully');
}
