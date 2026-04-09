import { NextResponse } from 'next/server';
import { lookupSceneByCode } from '@/src/browser/lookup';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code')?.trim();
  const apiKey = request.headers.get('x-javstash-api-key')?.trim();

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: 'MISSING_API_KEY',
        message: 'Missing JavStash ApiKey',
      },
      { status: 401 }
    );
  }

  if (!code) {
    return NextResponse.json(
      {
        ok: false,
        error: 'INVALID_CODE',
        message: 'Missing or invalid scene code',
      },
      { status: 400 }
    );
  }

  try {
    const result = await lookupSceneByCode(code, apiKey);

    return NextResponse.json({
      ok: true,
      code: result.code,
      title: result.title,
      description: result.description,
      translated: result.translated,
      source: 'javstash-proxy',
    });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      'status' in error &&
      typeof error.code === 'string' &&
      typeof error.status === 'number'
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: error.code,
          message: error instanceof Error ? error.message : 'Lookup failed',
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Lookup failed',
      },
      { status: 500 }
    );
  }
}
