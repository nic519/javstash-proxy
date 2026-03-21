# Next.js 管理后台设计文档

## 概述

为 javstash-proxy 项目添加图形化管理界面，包含 GraphQL 测试、数据浏览和缓存管理功能。

## 需求

- **功能**：GraphQL 测试 + 数据浏览 + 管理后台
- **UI 风格**：现代管理后台，使用 shadcn/ui，侧边栏导航
- **认证**：环境变量密码保护
- **数据浏览**：关键词搜索 + 日期筛选 + 标签/演员筛选
- **部署**：UI 和 API 合并在同一 Vercel 项目

## 架构

```
javstash-proxy/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局（侧边栏 + 认证检查）
│   ├── page.tsx                  # Dashboard 首页
│   ├── login/
│   │   └── page.tsx              # 登录页
│   ├── playground/
│   │   └── page.tsx              # GraphQL Playground
│   ├── browse/
│   │   └── page.tsx              # 数据浏览（搜索/筛选/结果列表）
│   ├── admin/
│   │   ├── page.tsx              # 缓存统计概览
│   │   └── cache/
│   │       └── page.tsx          # 缓存管理（查看/清除）
│   └── api/
│       ├── auth/
│       │   └── route.ts          # 登录验证 API
│       └── graphql/
│           └── route.ts          # GraphQL 代理（迁移自 api/graphql.ts）
│
├── src/                          # 现有业务逻辑（保持不变）
│   ├── handler.ts
│   ├── config.ts
│   ├── types.ts
│   ├── cache/
│   ├── translator/
│   ├── processor/
│   └── upstream/
│
├── components/
│   └── ui/                       # shadcn/ui 组件
│
├── lib/
│   ├── auth.ts                   # 认证工具函数
│   └── utils.ts                  # 通用工具
│
└── middleware.ts                 # 路由保护中间件
```

**关键点：**
- 现有 `src/` 目录完全不改动
- 新增 `app/` 目录存放 Next.js 页面
- `api/graphql/route.ts` 包装现有 `handleGraphQLRequest`

## 页面与组件

### 页面结构

| 路由 | 功能 | 核心组件 |
|------|------|----------|
| `/login` | 密码登录 | PasswordForm |
| `/` | Dashboard 概览 | StatCard, RecentQueries |
| `/playground` | GraphQL 测试 | QueryEditor, ResponseViewer |
| `/browse` | 数据浏览 | SearchBar, FilterPanel, ResultGrid |
| `/admin` | 缓存统计 | CacheStats, TranslationStats |
| `/admin/cache` | 缓存管理 | CacheTable, ClearButton |

### 侧边栏导航

```
┌─────────────────────┐
│  🎬 JavStash Proxy  │
├─────────────────────┤
│ 📊 Dashboard        │
│ 🔍 数据浏览         │
│ 🧪 GraphQL 测试     │
├─────────────────────┤
│ ⚙️ 管理             │
│   └─ 缓存统计       │
│   └─ 翻译统计       │
├─────────────────────┤
│ 🚪 退出登录         │
└─────────────────────┘
```

### shadcn/ui 组件使用

- `Button`, `Input`, `Card` - 基础 UI
- `Table` - 数据展示
- `Dialog` - 确认操作
- `Toast` - 操作反馈
- `Sidebar` - 导航
- `DateRangePicker` - 日期筛选
- `Badge` - 标签展示

## 数据流与 API

### 认证流程

```
用户输入密码
    │
    ▼
POST /api/auth ──► 验证 ADMIN_PASSWORD 环境变量
    │
    ├── 成功 ──► Set-Cookie (httpOnly) ──► 跳转 /
    │
    └── 失败 ──► 返回 401 ──► 显示错误
```

**中间件保护**：所有 `/playground`、`/browse`、`/admin` 路由检查 cookie，未登录重定向到 `/login`

### API 端点

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/auth` | POST | 登录验证 |
| `/api/auth` | DELETE | 退出登录 |
| `/api/graphql` | POST | GraphQL 代理（现有逻辑） |
| `/api/admin/cache` | GET | 获取缓存统计 |
| `/api/admin/cache` | DELETE | 清除缓存 |
| `/api/admin/stats` | GET | 翻译统计 |

### 数据浏览查询流

```
用户输入搜索条件
    │
    ▼
POST /api/graphql (代理)
    │
    ▼
上游 JavStash API
    │
    ▼
翻译处理 + 缓存检查
    │
    ▼
返回翻译后的中文结果
    │
    ▼
前端 ResultGrid 展示
```

## 错误处理

| 场景 | 处理方式 |
|------|----------|
| 密码错误 | Toast 提示 "密码错误"，不跳转 |
| Session 过期 | 中间件检测到无效 cookie，重定向 `/login` |
| GraphQL 查询失败 | ResponseViewer 显示错误信息，保留查询内容 |
| 上游 API 超时 | Toast 提示 "请求超时，请重试" |
| 缓存操作失败 | Dialog 确认 + Toast 反馈结果 |

### 表单验证

- 搜索关键词：可选，最大 100 字符
- 日期范围：开始日期 ≤ 结束日期
- 清除缓存：需二次确认 Dialog

## 测试策略

```
tests/
├── unit/
│   └── auth.test.ts        # 密码验证逻辑
├── integration/
│   └── api.test.ts         # API 端点测试
└── e2e/
    └── login-flow.test.ts  # 登录流程（可选）
```

**测试重点：**
- 认证中间件正确拦截/放行
- GraphQL 代理正常转发
- 缓存统计 API 返回正确格式

## 环境变量

新增：
```
ADMIN_PASSWORD=your_password_here
```

现有保持不变：
```
JAVSTASH_API_KEY=xxx
TURSO_URL=xxx
TURSO_AUTH_TOKEN=xxx
DEEPLX_API_URL=xxx
```

## 技术栈

- **框架**：Next.js 15 (App Router)
- **UI**：shadcn/ui + Tailwind CSS
- **认证**：Cookie-based，iron-session 或自实现
- **状态管理**：React useState + URL params（搜索条件）
- **数据获取**：Server Actions / fetch
