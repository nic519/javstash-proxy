import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'admin_session';

type SessionType = 'admin' | 'javstash';

/**
 * 解析 token 获取会话类型和过期时间
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
 * 检查请求的认证状态
 */
function checkAuth(request: NextRequest): { authenticated: boolean; type: SessionType | null } {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return { authenticated: false, type: null };

  const parsed = parseSessionToken(token);
  if (!parsed) return { authenticated: false, type: null };

  if (Date.now() >= parsed.expires) {
    return { authenticated: false, type: null };
  }

  return { authenticated: true, type: parsed.type };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { authenticated, type } = checkAuth(request);

  // /admin 路由只允许 admin 类型会话
  if (pathname.startsWith('/admin')) {
    if (!authenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (type !== 'admin') {
      // javstash 用户重定向到 browse 页面
      return NextResponse.redirect(new URL('/browse', request.url));
    }
  }

  // 其他受保护的前端路由
  const otherProtectedRoutes = ['/playground', '/browse'];
  const isProtectedRoute = otherProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !authenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 受保护的 API 路由
  if (pathname.startsWith('/api/admin') && !authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 已登录用户访问登录页时重定向
  if (pathname === '/login' && authenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/playground/:path*', '/browse/:path*', '/admin/:path*', '/api/admin/:path*', '/login'],
};
