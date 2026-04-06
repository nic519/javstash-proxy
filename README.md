# JavStash Proxy

JavStash GraphQL 代理服务，支持自动将日文元数据翻译为中文。

## 项目简介

本项目是 [JavStash](https://javstash.org) 的中转代理服务，主要功能：

- **GraphQL 代理**：转发 GraphQL 请求至 JavStash 上游服务
- **自动翻译**：将日文标题和简介自动翻译为中文
- **网站登录**：使用 Clerk 登录网站后台与调试工具
- **管理后台**：可视化管理翻译缓存，管理员邮箱自动获得写权限

## 技术栈

- **框架**：Next.js 16 (App Router)
- **运行时**：Edge Runtime
- **前端**：React 19 + Tailwind CSS 4
- **登录**：Clerk
- **数据库**：Turso (libSQL)
- **翻译服务**：DeepLX
- **部署**：Vercel

## 快速开始

### 安装依赖

```bash
bun install
```

### 配置环境变量

创建 `.env.local` 文件并配置以下环境变量：

```env
JAVSTASH_API_KEY=your-javstash-api-key
TURSO_URL=your-turso-database-url
TURSO_AUTH_TOKEN=your-turso-auth-token
DEEPLX_API_URL=your-deeplx-api-url
CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
ADMIN_EMAILS=admin@example.com
```

### 本地开发

```bash
vercel dev
```

或使用：

```bash
bun run dev
```

### 部署

```bash
vercel --prod
```

## 环境变量说明

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `JAVSTASH_API_KEY` | JavStash API 密钥，用于访问上游服务 | 是 |
| `TURSO_URL` | Turso 数据库连接地址 | 是 |
| `TURSO_AUTH_TOKEN` | Turso 数据库认证令牌 | 是 |
| `DEEPLX_API_URL` | DeepLX 翻译服务 API 地址 | 是 |
| `CLERK_PUBLISHABLE_KEY` | Clerk 前端公钥 | 是 |
| `CLERK_SECRET_KEY` | Clerk 服务端密钥 | 是 |
| `ADMIN_EMAILS` | 管理员邮箱白名单，多个邮箱用英文逗号分隔；命中的 Clerk 用户可编辑后台数据 | 否 |

## API 使用

### 端点地址

```
https://javstash.vercel.app/api/graphql
```

### 认证方式

GraphQL 代理请求需在 Header 中携带 JavStash 上游 API Key：

```javascript
fetch("https://javstash.vercel.app/api/graphql", {
  headers: {
    "Content-Type": "application/json",
    "ApiKey": "your-api-key"
  }
})
```

### 获取 API Key

通过 [Discord](https://discord.gg/javstash) 获取 JavStash API Key。这个 ApiKey 只用于 `/api/graphql` 上游代理请求，不用于网站登录。

## 网站登录与权限

- 网站登录、`/playground` 访问和后台身份识别都基于 Clerk。
- `/admin` 对所有已登录用户开放只读访问。
- `ADMIN_EMAILS` 中的邮箱会被识别为管理员，可执行编辑、删除和缓存管理操作。
- 网站登录不再接受 JavStash ApiKey 或独立后台密码。

## 页面说明

| 路径 | 说明 |
|------|------|
| `/` | 首页，展示代理端点、网站登录入口和使用说明 |
| `/playground` | GraphQL 调试工具（需 Clerk 登录） |
| `/admin` | 统一数据页面，已登录用户只读，管理员可管理翻译缓存 |

## 工作原理

```
客户端请求 → 代理服务 → 检查缓存
                           ↓
              命中缓存 → 直接返回中文结果
                           ↓
              未命中 → 转发至 JavStash → 获取日文数据
                           ↓
                    DeepLX 翻译 → 存入缓存 → 返回中文结果
```

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── graphql/       # GraphQL 入口
│   │   ├── session/       # 当前 Clerk 会话信息
│   │   └── admin/         # 管理接口
│   ├── admin/             # 统一数据页面（普通用户只读，管理员可编辑）
│   └── playground/        # GraphQL Playground
├── src/                   # 核心业务逻辑
│   ├── handler.ts         # 请求处理器
│   ├── upstream/          # 上游服务对接
│   ├── translator/        # 翻译模块
│   ├── cache/             # 缓存模块
│   └── processor/         # 响应处理
└── lib/                   # 工具函数
```

## 开发命令

```bash
# 开发模式
bun run dev

# 构建生产版本
bun run build

# 类型检查
bun run typecheck

# 运行测试
bun run test

# 测试监听模式
bun run test:watch
```

## 许可证

ISC
