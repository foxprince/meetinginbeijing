// 数据库初始化脚本
// 运行: npx ts-node scripts/init-db.ts

import dotenv from 'dotenv';
dotenv.config();

import { initDb } from '../src/lib/db';

async function main() {
  try {
    console.log('Initializing database...');
    await initDb();
    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

main();
