import { createClient } from '@libsql/client';
import nextEnv from '@next/env';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEARCH_SCENE_QUERY } from '../src/graphql/query-constants.js';

const JAVSTASH_URL = 'https://javstash.org/graphql';
const BAD_COVER_PREFIX = 'http://192';
const DEFAULT_CONCURRENCY = 5;
const DEFAULT_BATCH_SIZE = 20;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = path.resolve(__dirname, '..');
const { loadEnvConfig } = nextEnv;

export function isMissingRawResponse(record) {
  return !record || typeof record.raw_response !== 'string' || record.raw_response.trim() === '';
}

export function isBadCoverUrl(coverUrl) {
  return typeof coverUrl === 'string' && coverUrl.startsWith(BAD_COVER_PREFIX);
}

export function extractCoverUrlFromScene(scene) {
  if (!scene || !Array.isArray(scene.images)) {
    return null;
  }

  for (const image of scene.images) {
    if (image && typeof image.url === 'string' && image.url.trim()) {
      return image.url.trim();
    }
  }

  return null;
}

export function selectSceneForCode(code, scenes) {
  if (!Array.isArray(scenes) || scenes.length === 0) {
    return null;
  }

  const normalizedCode = typeof code === 'string' ? code.trim().toUpperCase() : '';
  return scenes.find((scene) => scene?.code?.toUpperCase() === normalizedCode) ?? scenes[0] ?? null;
}

export function chunkArray(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function parsePositiveIntFlag(flagName, defaultValue) {
  const prefix = `${flagName}=`;
  const entry = process.argv.find((arg) => arg.startsWith(prefix));
  if (!entry) {
    return defaultValue;
  }

  const parsed = Number.parseInt(entry.slice(prefix.length), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : defaultValue;
}

function loadScriptConfig() {
  loadEnvConfig(projectDir);

  const javstashApiKey = process.env.JAVSTASH_API_KEY;
  const tursoUrl = process.env.TURSO_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

  if (!javstashApiKey) {
    throw new Error('JAVSTASH_API_KEY is required');
  }

  if (!tursoUrl) {
    throw new Error('TURSO_URL is required');
  }

  if (!tursoAuthToken) {
    throw new Error('TURSO_AUTH_TOKEN is required');
  }

  return { javstashApiKey, tursoUrl, tursoAuthToken };
}

async function fetchSceneByCode(code, apiKey) {
  const response = await fetch(JAVSTASH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ApiKey: apiKey,
    },
    body: JSON.stringify({
      operationName: 'Search',
      query: SEARCH_SCENE_QUERY,
      variables: { term: code },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`JavStash error for ${code}: ${response.status} ${response.statusText} - ${body}`);
  }

  const payload = await response.json();
  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    throw new Error(`JavStash GraphQL error for ${code}: ${payload.errors[0]?.message || 'Unknown error'}`);
  }

  return selectSceneForCode(code, payload?.data?.searchScene);
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= items.length) {
        return;
      }

      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const concurrency = parsePositiveIntFlag('--concurrency', DEFAULT_CONCURRENCY);
  const batchSize = parsePositiveIntFlag('--batch-size', DEFAULT_BATCH_SIZE);
  const { javstashApiKey, tursoUrl, tursoAuthToken } = loadScriptConfig();
  const client = createClient({ url: tursoUrl, authToken: tursoAuthToken });

  const result = await client.execute({
    sql: `SELECT code, cover_url, raw_response
          FROM translations
          WHERE raw_response IS NULL OR raw_response = ''`,
  });

  const candidates = result.rows.filter(isMissingRawResponse);
  if (candidates.length === 0) {
    console.log('No rows are missing raw_response.');
    return;
  }

  console.log(`${dryRun ? '[dry-run] ' : ''}Found ${candidates.length} rows missing raw_response.`);

  const notFound = [];
  const fetched = await mapWithConcurrency(candidates, concurrency, async (row) => {
    const code = typeof row.code === 'string' ? row.code : '';
    if (!code) {
      return null;
    }

    try {
      const scene = await fetchSceneByCode(code, javstashApiKey);
      if (!scene) {
        notFound.push(code);
        return null;
      }

      const nextRawResponse = JSON.stringify(scene);
      const nextCoverUrl = extractCoverUrlFromScene(scene);
      const update = {
        code,
        nextRawResponse,
        nextCoverUrl: isBadCoverUrl(row.cover_url) && nextCoverUrl ? nextCoverUrl : null,
      };

      console.log(`${code}: raw_response fetched${update.nextCoverUrl ? `, cover_url queued -> ${update.nextCoverUrl}` : ''}`);
      return update;
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      return null;
    }
  });

  const updates = fetched.filter(Boolean);

  if (notFound.length > 0) {
    console.log(`Not found: ${notFound.join(', ')}`);
  }

  if (dryRun || updates.length === 0) {
    if (!dryRun && updates.length === 0) {
      console.log('No rows were updated.');
    }
    return;
  }

  const chunks = chunkArray(updates, batchSize);
  let committed = 0;

  for (const [chunkIndex, chunk] of chunks.entries()) {
    await client.batch(
      chunk.map((update) => ({
        sql: update.nextCoverUrl
          ? 'UPDATE translations SET raw_response = ?, cover_url = ? WHERE code = ?'
          : 'UPDATE translations SET raw_response = ? WHERE code = ?',
        args: update.nextCoverUrl
          ? [update.nextRawResponse, update.nextCoverUrl, update.code]
          : [update.nextRawResponse, update.code],
      })),
      'write'
    );

    committed += chunk.length;
    console.log(`Committed chunk ${chunkIndex + 1}/${chunks.length} (${committed}/${updates.length})`);
  }

  console.log(`Updated ${updates.length} rows.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
