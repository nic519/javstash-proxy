import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'admin_session';

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [_, expiresStr] = decoded.split(':');
    const expires = parseInt(expiresStr, 10);
    return Date.now() < expires;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = checkAuth(request);

  // Protected frontend routes
  const protectedRoutes = ['/playground', '/browse', '/admin'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protected API routes
  if (pathname.startsWith('/api/admin') && !isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Redirect logged-in users away from login page
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/playground/:path*', '/browse/:path*', '/admin/:path*', '/api/admin/:path*', '/login'],
};
