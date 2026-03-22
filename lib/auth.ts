import { cookies } from 'next/headers';

const SESSION_COOKIE = 'admin_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export type SessionType = 'admin' | 'javstash';
export type JavStashValidationResult = 'valid' | 'invalid' | 'network_error';

export function validatePassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return password === adminPassword;
}

/**
 * 验证 JavStash API Key 有效性
 * 通过发送简单 GraphQL 查询测试连接
 */
export async function validateJavStashKey(apiKey: string): Promise<JavStashValidationResult> {
  try {
    const response = await fetch('https://javstash.org/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': apiKey,
      },
      body: JSON.stringify({
        query: 'query { searchScene(term: "test") { id } }',
      }),
    });

    if (response.ok) {
      return 'valid';
    } else if (response.status === 401 || response.status === 403) {
      return 'invalid';
    } else {
      // 其他错误状态码，可能是 key 无效
      return 'invalid';
    }
  } catch {
    return 'network_error';
  }
}

export async function createSession(type: SessionType): Promise<void> {
  const cookieStore = await cookies();
  const expires = Date.now() + SESSION_DURATION;
  const token = Buffer.from(`${type}:${expires}`).toString('base64');

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * 解析 token 获取会话类型
 */
function parseSessionToken(token: string): { type: SessionType; expires: number } | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [typeStr, expiresStr] = decoded.split(':');
    const expires = parseInt(expiresStr, 10);

    if (typeStr !== 'admin' && typeStr !== 'javstash') {
      return null;
    }

    return { type: typeStr, expires };
  } catch {
    return null;
  }
}

/**
 * 获取当前会话类型
 */
export async function getSessionType(): Promise<SessionType | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const parsed = parseSessionToken(token);
  if (!parsed || Date.now() >= parsed.expires) {
    return null;
  }

  return parsed.type;
}

/**
 * 检查当前会话是否为管理员
 */
export async function isAdmin(): Promise<boolean> {
  const type = await getSessionType();
  return type === 'admin';
}

/**
 * 检查是否已登录（任何类型）
 */
export async function isAuthenticated(): Promise<boolean> {
  const type = await getSessionType();
  return type !== null;
}
