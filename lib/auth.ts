import { cookies } from 'next/headers';

const SESSION_COOKIE = 'admin_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function validatePassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return password === adminPassword;
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  const expires = Date.now() + SESSION_DURATION;
  const token = Buffer.from(`admin:${expires}`).toString('base64');

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

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

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
