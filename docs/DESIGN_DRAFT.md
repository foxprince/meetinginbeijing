# meetinginbeijing.com 网站设计稿 (Next.js 版)

## 1. 视觉规范 (Design System)

### 1.1 配色方案 (Color Palette)
- **Primary (主色)**: `#059669` (Emerald Green) - 代表生机、亲和、生命力。
- **Secondary (辅色)**: `#F0FDF4` (Light Green / Mint) - 用于背景块、装饰、强调。
- **Accent (强调色)**: `#0EA5E9` (Sky Blue) - 用于次要按钮、链接、图标。
- **Background (背景)**: 
  - Main: `#FFFFFF` (White)
  - Secondary: `#F0FDF4` (Very Light Green) - 用于区分不同模块。
- **Text (文本)**: 
  - Heading: `#0F172A` (Slate 900)
  - Body: `#334155` (Slate 700)

### 1.2 字体 (Typography)
- **English**: `Inter`, `system-ui`
- **Chinese**: `Noto Sans SC`, `Microsoft YaHei`
- **Scale**:
  - H1: 3.75rem (60px) / Leading 1.2 (Mobile: 2.5rem)
  - H2: 2.25rem (36px) / Leading 1.3
  - Body: 1rem (16px) / Leading 1.6

### 1.3 组件库 (Component Library)
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React

---

## 2. 首页模块设计 (High-Fidelity Wireframe)

### 2.1 Hero Section
- **布局**: 左右布局 (Desktop) / 垂直堆叠 (Mobile)
- **左侧**: 
  - 引人注目的 H1: "Your Trusted Local Partner in Beijing"
  - 副标题强调 Business, Medical, Daily 场景。
  - 两个按钮: [Book a Free Consultation] (Primary), [Explore Services] (Outline)
- **右侧**: Jane 的职业形象照或北京地标与商务场景结合的高清图（带磨砂效果）。

### 2.2 Core Services (Grid)
- **设计**: 3x2 网格卡片。
- **交互**: Hover 时卡片轻微浮起，边框色变为金色。
- **内容**: 每个服务包含 Lucide 图标 + 标题 + 一句核心价值说明。

### 2.3 How It Works (Timeline)
- **设计**: 水平/垂直步骤条。
- **流程**: 
  1. Share Needs
  2. Get Quote
  3. Execution
  4. Follow-up

---

## 3. 技术架构 (Technical Architecture)

### 3.1 目录结构
```text
src/
├── app/               # 页面路由
├── components/        # UI 组件
│   ├── sections/      # 首页各模块
│   └── ui/            # shadcn 基础组件
├── lib/               # 工具函数
└── config/            # 站点配置 (文案、链接)
```

### 3.2 国际化 (i18n) 方案
- **初期**: 采用基于配置的对象映射，支持 `en` 和 `zh`。
- **路由**: `/` (English) 和 `/zh` (中文)。

---

## 4. 下一步行动
1. **初始化 Next.js**: 使用 `--non-interactive` 模式。
2. **安装 shadcn/ui**: 基础按钮、卡片、导航。
3. **实现 Hero 模块**: 建立视觉基调。
