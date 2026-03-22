import { NextResponse } from 'next/server';
import { validatePassword, createSession, destroySession } from '@/lib/auth';

/**
 * 处理登录请求
 * 验证密码并创建会话
 */
export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // 校验密码参数
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password required' },
        { status: 400 }
      );
    }

    // 验证密码是否正确
    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // 创建登录会话
    await createSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 处理登出请求
 * 销毁当前会话
 */
export async function DELETE() {
  await destroySession();
  return NextResponse.json({ success: true });
}
