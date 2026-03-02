# MeetingInBeijing

## 项目概述
MeetingInBeijing 是一个为在北京生活和工作的人提供信息和资源的网站。

## 技术栈
- **前端**: Next.js 16.1.6, React 19, TypeScript, TailwindCSS
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL
- **部署**: Nginx + systemd

## 项目结构
```
/web                    # Next.js 前端应用
├── src/
│   ├── app/           # Next.js App Router
│   ├── components/    # React 组件
│   ├── config/        # 配置文件
│   └── lib/           # 工具库
├── public/            # 静态资源
└── scripts/           # 构建脚本
/scripts/deploy/       # 部署脚本
```

## 部署指南

### 生产环境部署
使用部署脚本快速部署到生产环境：

```bash
scripts/deploy/deploy-prod.sh "commit message"
```

脚本会自动执行以下步骤：
1. 提交本地改动到 Git
2. 推送到远程仓库（Gitee）
3. 在生产服务器上拉取最新代码
4. 安装依赖
5. 构建应用
6. 重启服务

### 环境配置
生产环境需要以下环境变量（在 `/home/app/git/meetinginbeijing/web/.env`）：
- `POSTGRES_URL`: PostgreSQL 连接字符串
- `ADMIN_SESSION_TOKEN`: 管理员会话令牌
- `S3_*`: 对象存储配置

## 已知问题和修复

### 2026-03-02: Blog 页面 500 错误修复
**问题**: Blog 页面访问时出现 `ECONNREFUSED` 错误，无法连接到数据库。

**根本原因**: PostgreSQL 连接字符串中的密码包含特殊字符 `&`，在 URL 中被编码为 `%26`。`pg` 库在处理 URL 编码的密码时出现问题。

**修复方案**:
1. 修改 `src/lib/db.ts`，使用分离的连接配置而不是连接字符串
2. 正确解码 URL 中的密码（`%26` -> `&`）
3. 修改部署脚本，在构建时使用真实的环境变量而不是虚拟的 `.env.local`

**相关提交**:
- `914c8b1`: 使用分离的连接配置而不是连接字符串，正确处理 URL 编码的密码
- `8e30584`: 使用真实环境变量进行构建，而不是虚拟的 .env.local
- `6ace006`: 正确解码 PostgreSQL 连接字符串中的密码

## 常见命令

### 本地开发
```bash
cd web
pnpm install
pnpm dev
```

### 构建
```bash
cd web
pnpm build
pnpm start
```

### 数据库连接
```bash
PGPASSWORD=dkgIdIK9d&8 psql -h admin.ydd-club.com -p 5432 -U jane -d meetinginbeijing
```

## 管理员信息
- 用户名: admin
- 密码: pwd4Ydd!
- 测试环境后台: https://jane.ehinfo.com.cn/admin/
- 生产环境后台: https://jane.ydd-club.com/admin/

## 服务器信息
- 测试域名: jane.ehinfo.com.cn
- 生产域名: jane.ydd-club.com
- 本地代码位置: /Users/zj/git/meetinginbeijing
- 服务器代码位置: /home/app/git/meetinginbeijing
- 快速连接命令: `~/bin/toYddEcs` (生产)

## 接口限制
- `/api/activities/` 等列表接口的 `page_size` 最大为 **100**
