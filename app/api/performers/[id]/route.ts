import { NextRequest, NextResponse } from 'next/server';
import { TursoCache } from '@/src/cache/turso';
import { loadConfig } from '@/src/config';
import { getOrFetchPerformer } from '@/src/performers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const performerId = decodeURIComponent(id).trim();

    if (!performerId) {
      return NextResponse.json({ ok: false, error: 'INVALID_ID' }, { status: 400 });
    }

    const config = loadConfig();
    const cache = new TursoCache(config.tursoUrl, config.tursoAuthToken);
    const performer = await getOrFetchPerformer(performerId, cache, config.javstashApiKey);

    if (!performer) {
      return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, performer });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
