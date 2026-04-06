import { NextRequest, NextResponse } from 'next/server';
import { getAppAuthState } from '@/lib/authz';
import { loadConfig } from '@/src/config';
import { TursoCache } from '@/src/cache/turso';
import {
  USER_ITEM_TAGS,
  type Translation,
  type UserItemTag,
  type UserItemTagRecord,
} from '@/components/shared/types';

function getCache(): TursoCache {
  const config = loadConfig();
  return new TursoCache(config.tursoUrl, config.tursoAuthToken);
}

function isUserItemTag(value: string | null | undefined): value is UserItemTag {
  return USER_ITEM_TAGS.includes(value as UserItemTag);
}

function groupTagsByCode(records: UserItemTagRecord[]): Record<string, UserItemTag[]> {
  return records.reduce<Record<string, UserItemTag[]>>((acc, record) => {
    const current = acc[record.itemCode] ?? [];
    current.push(record.tag);
    acc[record.itemCode] = current;
    return acc;
  }, {});
}

async function requireUserEmail() {
  const authState = await getAppAuthState();

  if (!authState.authenticated || !authState.email) {
    return null;
  }

  return authState.email;
}

async function resolveTaggedItems(cache: TursoCache, records: UserItemTagRecord[]): Promise<Translation[]> {
  const codes = Array.from(new Set(records.map((record) => record.itemCode)));
  const translations = await cache.getTranslations(codes);
  const translationMap = new Map(translations.map((item) => [item.code, item]));

  return codes
    .map((code) => translationMap.get(code))
    .filter((item): item is Translation => Boolean(item));
}

export async function GET(request: NextRequest) {
  const userEmail = await requireUserEmail();

  if (!userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const tag = searchParams.get('tag');
  const codes = searchParams.getAll('code').map((code) => code.trim()).filter(Boolean);

  if (tag && !isUserItemTag(tag)) {
    return NextResponse.json({ error: 'Invalid tag' }, { status: 400 });
  }

  const resolvedTag = isUserItemTag(tag) ? tag : undefined;

  try {
    const cache = getCache();
    const records = await cache.listUserItemTags({
      userEmail,
      tag: resolvedTag,
      itemCodes: codes.length > 0 ? codes : undefined,
    });
    const groupedTags = groupTagsByCode(records);
    const items = resolvedTag ? await resolveTaggedItems(cache, records) : [];

    return NextResponse.json({
      records,
      groupedTags,
      items,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const userEmail = await requireUserEmail();

  if (!userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === 'string' ? body.code.trim() : '';
  const tag = typeof body?.tag === 'string' ? body.tag.trim() : '';

  if (!code) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
  }

  if (!isUserItemTag(tag)) {
    return NextResponse.json({ error: 'Invalid tag' }, { status: 400 });
  }

  try {
    const cache = getCache();
    await cache.upsertUserItemTag({ userEmail, itemCode: code, tag });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const userEmail = await requireUserEmail();

  if (!userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === 'string' ? body.code.trim() : '';
  const tag = typeof body?.tag === 'string' ? body.tag.trim() : '';

  if (!code) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
  }

  if (!isUserItemTag(tag)) {
    return NextResponse.json({ error: 'Invalid tag' }, { status: 400 });
  }

  try {
    const cache = getCache();
    await cache.deleteUserItemTag({ userEmail, itemCode: code, tag });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
