# 双重密码登录系统设计

## 概述

实现两种登录方式，支持不同权限级别：
- **超级管理密码**：环境变量 `ADMIN_PASSWORD`，可访问所有路由
- **JavStash API Key**：通过验证与 JavStash 服务的通讯能力登录，无法访问 `/admin`

## 需求

1. 支持两种登录方式
2. API Key 用户无法访问 `/admin` 路由
3. 区分登录失败的错误类型（无效凭证 / 网络错误）

## 技术设计

### Token 格式

使用单一 cookie `admin_session`，通过 token 前缀区分身份：

| 身份 | Token 格式 | 权限 |
|-----|-----------|------|
| 管理员 | `admin:${expires}` (base64) | 全部路由 |
| API Key 用户 | `api_key:${expires}` (base64) | 除 `/admin` 外 |

### 文件变更

#### 1. `lib/auth.ts`

新增函数：

```typescript
// 验证 JavStash API Key 有效性
export async function validateApiKey(apiKey: string): Promise<'valid' | 'invalid' | 'network_error'>

// 创建会话（支持类型参数）
export async function createSession(type: 'admin' | 'api_key'): Promise<void>

// 检查当前会话是否为管理员
export async function isAdmin(): Promise<boolean>

// 获取当前会话类型
export async function getSessionType(): Promise<'admin' | 'api_key' | null>
```

修改 `validatePassword` 保持不变。

#### 2. `app/api/auth/route.ts`

修改 POST 处理：

```typescript
// 请求体
{ password: string, type: 'admin' | 'api_key' }

// 响应
{ success: true }
{ error: 'invalid_credentials' | 'api_key_invalid' | 'network_error' }
```

#### 3. `middleware.ts`

修改 `/admin` 路由保护逻辑：

```typescript
// /admin 只允许 admin 类型会话
if (pathname.startsWith('/admin')) {
  const sessionType = getSessionTypeFromToken(token);
  if (sessionType !== 'admin') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

#### 4. `app/login/page.tsx`

- 添加登录方式选择（两个选项：管理员密码 / API Key）
- 根据错误类型显示不同提示：
  - `invalid_credentials` → "密码错误"
  - `api_key_invalid` → "API Key 无效"
  - `network_error` → "网络错误，请重试"

### API Key 验证逻辑

发送简单 GraphQL 查询到 JavStash：

```graphql
query { version }
```

- 200 响应 → valid
- 401/403 响应 → invalid
- 网络错误 → network_error

## 实现步骤

1. 扩展 `lib/auth.ts` 认证函数
2. 更新 `app/api/auth/route.ts` 支持两种登录
3. 修改 `middleware.ts` 区分权限
4. 更新 `app/login/page.tsx` UI 和错误处理
