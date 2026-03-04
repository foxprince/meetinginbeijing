# MeetingInBeijing

## 项目概述
MeetingInBeijing 是一个为在北京生活和工作的人提供信息和资源的网站。

## 技术栈
- **前端**: Next.js 16.1.6, React 19, TypeScript, TailwindCSS
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL
- **部署**: Nginx + systemd

## 简单 CMS 功能（MVP）

### 后台入口
- `/admin/cms`

### 当前支持可编辑区块
- `navbar`（品牌标题、副标题、CTA 文案）
- `who_i_help`（标题、描述、卡片列表）
- `pricing`（标题、免责声明、价格卡片、透明收费文案）

### 数据结构
- 表名：`cms_sections`
- 字段：
  - `section_key`（主键）
  - `draft_content_en` / `draft_content_zh`
  - `published_content_en` / `published_content_zh`
  - `status`（`draft` / `published`）
  - `published_at` / `created_at` / `updated_at`

### 发布流程
1. 在 `/admin/cms` 编辑英文和中文 JSON 草稿。
2. 点击“保存草稿”。
3. 点击“发布到前台”，将草稿拷贝到已发布内容。
4. 前台组件通过 `/api/cms/section` 获取已发布内容；若 CMS 异常，自动回退到 `src/config/content.ts` 默认文案。

### 相关接口
- `GET /api/admin/cms`：后台读取区块列表
- `PUT /api/admin/cms`：后台保存草稿
- `POST /api/admin/cms`：后台发布区块
- `GET /api/cms/section?key=...&lang=en|zh`：前台读取已发布内容

## 留言功能（2026-03 更新）

### 前台
- 首页联系表单已接入留言提交
- 提交接口：`POST /api/contact-messages`
- 字段：`name`、`country`、`contact`、`service_type`、`preferred_date`、`message`

### 后台管理
- 新增管理页面：`/admin/messages`
- 可按状态筛选、关键词搜索、更新留言状态、填写管理员备注、删除留言
- 后台接口：
  - `GET /api/admin/contact-messages`
  - `PATCH /api/admin/contact-messages/:id`
  - `DELETE /api/admin/contact-messages/:id`

### 留言短信通知（阿里云短信）
- 触发时机：前台留言创建成功后自动发送
- 模板 ID：`SMS_501785871`
- 模板变量：`time`、`name`
- 短信内容：`您有新的留言,时间:${time},留言者:${name}`

#### 需要配置的环境变量（`/home/app/git/meetinginbeijing/web/.env`）
- `ALIYUN_SMS_ACCESS_KEY_ID`
- `ALIYUN_SMS_ACCESS_KEY_SECRET`
- `ALIYUN_SMS_SIGN_NAME`
- `ALIYUN_SMS_RECEIVER_PHONE`
- `ALIYUN_SMS_TEMPLATE_CODE`（可选，默认 `SMS_501785871`）
- `ALIYUN_SMS_ENDPOINT`（可选，默认 `dysmsapi.aliyuncs.com`）

### 数据表
- 新增表：`contact_messages`
- 状态枚举：`new`、`processing`、`resolved`

### 前台内联编辑（所见即所得）
管理员登录后访问前台页面时，可直接编辑内容：

**Navbar 区块**：
- 品牌标题、副标题文本旁显示铅笔图标（hover 可见）
- 点击进入编辑态，输入框内修改
- 按 Enter 保存，Esc 取消
- 自动保存草稿并发布到前台

**Who I Help / Pricing 区块**：
- 区块右上角显示"编辑"按钮（hover 可见）
- 点击弹出表单 Modal，编辑标题、描述、列表项等
- 点击"保存并发布"立即生效

**实现组件**：
- `@/hooks/use-admin-session.ts`：检测管理员登录状态（读取 cookie）
- `@/components/cms/editable-text.tsx`：单行/多行文本内联编辑
- `@/components/cms/editable-section.tsx`：区块级表单编辑
- `@/components/cms/inline-edit-button.tsx`：铅笔图标按钮

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

### 2026-03-04: 博客正文图片在生产环境不显示
**问题**: 部分博客文章（如带空格或特殊字符 slug 的文章）正文中的图片不显示。

**根本原因**: 博客详情页仅对封面图使用了 OSS 代理地址转换，正文 HTML 里的
`<img src="https://meetinginbeijing.oss-cn-beijing.aliyuncs.com/...">` 未统一改写为
`/api/public-image?url=...`，导致生产环境下正文图片直链加载失败。

**修复方案**:
1. 在 `web/src/app/blog/[slug]/page.tsx` 新增 `rewriteContentImageUrls`。
2. 渲染正文前，统一将 OSS 公网域名图片 URL 转换为 `/api/public-image` 代理地址。
3. 保持非 OSS 图片地址原样，避免影响第三方图片。

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

## 法务页面（2026-03 更新）

- 新增页面：`/privacy-policy`
- 新增页面：`/terms-of-service`
- 页脚 `Privacy Policy` 与 `Terms of Service` 链接已指向真实路由
- 两页内容已升级为完整中英文条款（含生效日期、支付规则、责任限制、争议解决等）
- 两页已接入 CMS，可在 `/admin/cms` 通过区块 `privacy_policy`、`terms_of_service` 编辑并发布

### 服务条款（Terms of Service）新增内容
- 支持付款方式：美元现金、人民币现金、Wise、Avosend、微信支付、支付宝、人民币银行转账
- 若客户仅支持 PayPal 等未列出的付款方式，可拒绝接单
- 联系电话：`86-19910329598`

### 隐私政策（Privacy Policy）新增内容
- 收集信息范围：姓名、联系方式等必要个人信息
- 使用目的：订单处理与服务交付
- 隐私问题联系渠道已补充电话：`86-19910329598`
