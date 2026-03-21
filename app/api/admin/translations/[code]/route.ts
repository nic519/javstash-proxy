import { NextRequest, NextResponse } from 'next/server';
import { TursoCache } from '@/src/cache/turso';
import { loadConfig } from '@/src/config';

function getCache(): TursoCache {
  const config = loadConfig();
  return new TursoCache(config.tursoUrl, config.tursoAuthToken);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const cache = getCache();
    const { code } = await params;
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
