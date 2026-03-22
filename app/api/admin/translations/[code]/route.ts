import { NextRequest, NextResponse } from 'next/server';
import { TursoCache } from '@/src/cache/turso';
import { loadConfig } from '@/src/config';

/**
 * 获取缓存实例
 * 根据配置创建 Turso 缓存连接
 */
function getCache(): TursoCache {
  const config = loadConfig();
  return new TursoCache(config.tursoUrl, config.tursoAuthToken);
}

/**
 * 获取单个翻译缓存详情
 * 根据代码查询对应的翻译数据
 *
 * 路由参数:
 * - code: 翻译条目的唯一标识码（需 URL 编码）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const cache = getCache();
    const { code } = await params;
    // URL 解码后查询
    const translation = await cache.getTranslation(decodeURIComponent(code));

    if (!translation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(translation);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * 更新翻译缓存
 * 修改指定代码的翻译内容
 *
 * 路由参数:
 * - code: 翻译条目的唯一标识码（需 URL 编码）
 *
 * 请求体:
 * - titleZh: 中文标题
 * - summaryZh: 中文简介
 * - coverUrl: 封面图片地址（可选）
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const cache = getCache();
    const { code } = await params;
    const body = await request.json();

    await cache.updateTranslation(decodeURIComponent(code), body);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * 删除翻译缓存
 * 移除指定代码的翻译记录
 *
 * 路由参数:
 * - code: 翻译条目的唯一标识码（需 URL 编码）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const cache = getCache();
    const { code } = await params;
    await cache.deleteTranslation(decodeURIComponent(code));
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
