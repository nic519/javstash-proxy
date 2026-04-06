import { NextResponse } from 'next/server';
import { getAppAuthState } from '@/lib/authz';
import { canManageAdminData } from '@/lib/session-permissions';
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
 * 获取缓存统计数据
 * 返回缓存条目数量等信息
 */
export async function GET() {
  try {
    const cache = getCache();
    const stats = await cache.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * 清空所有缓存
 * 删除数据库中的全部翻译缓存记录
 */
export async function DELETE() {
  try {
    if (!canManageAdminData(await getAppAuthState())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cache = getCache();
    await cache.clearAll();
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
