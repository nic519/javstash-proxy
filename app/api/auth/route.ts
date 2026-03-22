import { NextResponse } from 'next/server';
import {
  validatePassword,
  validateJavStashKey,
  createSession,
  destroySession,
  type SessionType,
} from '@/lib/auth';

interface LoginRequest {
  password: string;
  type: SessionType;
}

/**
 * 处理登录请求
 * 支持两种登录方式：管理员密码 和 JavStash API Key
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginRequest;
    const { password, type } = body;

    // 校验参数
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password required' },
        { status: 400 }
      );
    }

    if (type !== 'admin' && type !== 'javstash') {
      return NextResponse.json(
        { error: 'Invalid login type' },
        { status: 400 }
      );
    }

    // 根据登录类型验证
    if (type === 'admin') {
      if (!validatePassword(password)) {
        return NextResponse.json(
          { error: 'invalid_credentials' },
          { status: 401 }
        );
      }
    } else {
      // JavStash API Key 登录
      const result = await validateJavStashKey(password);
      if (result === 'invalid') {
        return NextResponse.json(
          { error: 'javstash_invalid' },
          { status: 401 }
        );
      } else if (result === 'network_error') {
        return NextResponse.json(
          { error: 'network_error' },
          { status: 503 }
        );
      }
    }

    // 创建登录会话
    await createSession(type);
    return NextResponse.json({ success: true });
  } catch {
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
