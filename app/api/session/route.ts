import { NextResponse } from 'next/server';
import { getSessionType } from '@/lib/auth';

/**
 * 获取当前会话信息
 * 返回用户的会话类型（admin 或 javstash）
 */
export async function GET() {
  const type = await getSessionType();

  if (!type) {
    return NextResponse.json({ authenticated: false, type: null });
  }

  return NextResponse.json({ authenticated: true, type });
}
