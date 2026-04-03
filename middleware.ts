import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { canAccessAdmin, canManageAdminData } from '@/lib/session-permissions';

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

  // /admin 路由允许任何已登录用户访问，普通用户只读
  if (pathname.startsWith('/admin')) {
    if (!authenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (!canAccessAdmin(type)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 其他受保护的前端路由
  const otherProtectedRoutes = ['/playground'];
  const isProtectedRoute = otherProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !authenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 受保护的 API 路由
  if (pathname.startsWith('/api/admin') && !authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (
    pathname.startsWith('/api/admin') &&
    request.method !== 'GET' &&
    !canManageAdminData(type)
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 已登录用户访问首页时重定向到管理页
  if (pathname === '/' && authenticated) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/playground/:path*', '/admin/:path*', '/api/admin/:path*'],
};
