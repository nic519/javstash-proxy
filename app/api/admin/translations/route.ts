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
 * 获取翻译缓存列表
 * 支持分页、关键词搜索和排序
 *
 * Query 参数:
 * - page: 页码，默认 1
 * - pageSize: 每页条数，默认 20
 * - search: 搜索关键词（可选）
 * - sortBy: 排序方式，'updated' 按修改时间 | 'code' 按番号首字母，默认 'updated'
 */
export async function GET(request: NextRequest) {
  try {
    const cache = getCache();
    const searchParams = request.nextUrl.searchParams;

    // 解析分页参数
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const search = searchParams.get('search') || undefined;
    const sortBy = (searchParams.get('sortBy') as 'updated' | 'code') || 'updated';

    const result = await cache.listTranslations({ page, pageSize, search, sortBy });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
