import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { decodePublicCodeToken } from '@/lib/public-code-token';
import { TursoCache } from '@/src/cache/turso';
import { loadLookupConfig } from '@/src/config';
import { PublicDetailClient } from './PublicDetailClient';

function getCache() {
  const config = loadLookupConfig();
  return new TursoCache(config.tursoUrl, config.tursoAuthToken);
}

async function getTranslationByToken(token: string) {
  const code = decodePublicCodeToken(token);
  if (!code) return null;

  const cache = getCache();
  const translation = await cache.getTranslation(code);

  if (!translation) return null;

  return {
    code,
    translation,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const record = await getTranslationByToken(token);

  if (!record) {
    return {
      title: '详情不存在',
    };
  }

  return {
    title: record.translation.titleZh || record.code,
    description: record.translation.summaryZh || `番号 ${record.code} 的详情页`,
  };
}

export default async function PublicDetailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const record = await getTranslationByToken(token);

  if (!record) {
    notFound();
  }

  const { translation } = record;

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <div className="px-1">
          <p
            className="text-xs uppercase tracking-[0.22em]"
            style={{ color: 'var(--text-muted)' }}
          >
            Public View
          </p>
          <h1
            className="mt-2 text-2xl font-medium sm:text-3xl"
            style={{ color: 'var(--accent-gold)' }}
          >
            {translation.titleZh || translation.code}
          </h1>
          <p
            className="mt-1 text-sm font-mono"
            style={{ color: 'var(--text-secondary)' }}
          >
            {translation.code}
          </p>
        </div>
        <div
          className="overflow-hidden rounded-[32px] border p-4 sm:p-6"
          style={{
            background: 'rgba(15, 15, 20, 0.88)',
            borderColor: 'var(--border-subtle)',
            boxShadow: '0 25px 80px -12px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <PublicDetailClient translation={translation} />
        </div>
      </div>
    </main>
  );
}
