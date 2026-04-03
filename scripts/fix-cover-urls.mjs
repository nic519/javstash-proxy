import { createClient } from '@libsql/client';
import nextEnv from '@next/env';
import path from 'path';
import { fileURLToPath } from 'url';

const BAD_COVER_PREFIX = 'http://192';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = path.resolve(__dirname, '..');
const { loadEnvConfig } = nextEnv;

export function extractCoverUrlFromRawResponse(rawResponse) {
  if (typeof rawResponse !== 'string' || !rawResponse.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawResponse);

    if (!parsed || Array.isArray(parsed) || !Array.isArray(parsed.images)) {
      return null;
    }

    for (const image of parsed.images) {
      if (image && typeof image.url === 'string' && image.url.trim()) {
        return image.url.trim();
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function shouldFixCoverUrl(record) {
  if (!record || typeof record.cover_url !== 'string') {
    return false;
  }

  return record.cover_url.startsWith(BAD_COVER_PREFIX) && typeof record.raw_response === 'string' && record.raw_response.trim() !== '';
}

function loadScriptConfig() {
  loadEnvConfig(projectDir);

  const tursoUrl = process.env.TURSO_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl) {
    throw new Error('TURSO_URL is required');
  }

  if (!tursoAuthToken) {
    throw new Error('TURSO_AUTH_TOKEN is required');
  }

  return { tursoUrl, tursoAuthToken };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const { tursoUrl, tursoAuthToken } = loadScriptConfig();
  const client = createClient({ url: tursoUrl, authToken: tursoAuthToken });

  const result = await client.execute({
    sql: `SELECT code, cover_url, raw_response
          FROM translations
          WHERE cover_url LIKE ? AND raw_response IS NOT NULL AND raw_response != ''`,
    args: [`${BAD_COVER_PREFIX}%`],
  });

  const candidates = result.rows.filter(shouldFixCoverUrl);
  const updates = [];

  for (const row of candidates) {
    const code = typeof row.code === 'string' ? row.code : '';
    const nextCoverUrl = extractCoverUrlFromRawResponse(
      typeof row.raw_response === 'string' ? row.raw_response : null
    );

    if (!code || !nextCoverUrl || nextCoverUrl === row.cover_url) {
      continue;
    }

    updates.push({
      code,
      previousCoverUrl: row.cover_url,
      nextCoverUrl,
    });
  }

  if (updates.length === 0) {
    console.log('No cover_url rows needed fixing.');
    return;
  }

  console.log(`${dryRun ? '[dry-run] ' : ''}Found ${updates.length} rows to fix.`);

  for (const update of updates) {
    console.log(`${update.code}: ${update.previousCoverUrl} -> ${update.nextCoverUrl}`);
  }

  if (dryRun) {
    return;
  }

  await client.batch(
    updates.map((update) => ({
      sql: 'UPDATE translations SET cover_url = ? WHERE code = ?',
      args: [update.nextCoverUrl, update.code],
    })),
    'write'
  );

  console.log(`Updated ${updates.length} rows.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
