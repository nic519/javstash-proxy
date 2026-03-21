import { NextResponse } from 'next/server';
import { TursoCache } from '@/src/cache/turso';
import { loadConfig } from '@/src/config';

function getCache(): TursoCache {
  const config = loadConfig();
  return new TursoCache(config.tursoUrl, config.tursoAuthToken);
}

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

export async function DELETE() {
  try {
    const cache = getCache();
    await cache.clearAll();
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
