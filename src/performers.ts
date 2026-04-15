import type { PerformerData } from './graphql/queries';
import { FIND_PERFORMER_QUERY } from './graphql/queries';
import type { TursoCache } from './cache/turso';
import type { CachedPerformer } from './types';
import { forwardToJavStash } from './upstream/javstash';

export function toCachedPerformer(performer: PerformerData): Omit<CachedPerformer, 'updated_at'> {
  return {
    id: performer.id ?? '',
    name: performer.name ?? undefined,
    aliases: performer.aliases ?? [],
    birth_date: performer.birth_date ?? undefined,
    height: performer.height ?? undefined,
    cup_size: performer.cup_size ?? undefined,
    band_size: performer.band_size ?? undefined,
    waist_size: performer.waist_size ?? undefined,
    hip_size: performer.hip_size ?? undefined,
    career_start_year: performer.career_start_year ?? undefined,
    career_end_year: performer.career_end_year ?? undefined,
    images: performer.images ?? [],
    full_json: performer,
  };
}

export async function fetchPerformerById(
  id: string,
  apiKey: string
): Promise<PerformerData | null> {
  const payload = await forwardToJavStash(
    {
      operationName: 'FindPerformer',
      query: FIND_PERFORMER_QUERY,
      variables: { id },
    },
    apiKey
  );

  if (
    payload &&
    typeof payload === 'object' &&
    'errors' in payload &&
    Array.isArray(payload.errors) &&
    payload.errors.length > 0
  ) {
    const message = typeof payload.errors[0]?.message === 'string'
      ? payload.errors[0].message
      : `Failed to fetch performer ${id}`;
    throw new Error(message);
  }

  const performer = (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    payload.data &&
    typeof payload.data === 'object' &&
    'findPerformer' in payload.data
      ? payload.data.findPerformer
      : null
  ) as PerformerData | null;

  return performer?.id ? performer : null;
}

export async function getOrFetchPerformer(
  id: string,
  cache: Pick<TursoCache, 'getPerformer' | 'upsertPerformer'>,
  apiKey: string
): Promise<CachedPerformer | null> {
  let cached: CachedPerformer | null = null;

  try {
    cached = await cache.getPerformer(id);
  } catch (error) {
    console.error(`Failed to read performer ${id} from cache`, error);
  }

  if (cached) {
    return cached;
  }

  const fetched = await fetchPerformerById(id, apiKey);

  if (!fetched) {
    return null;
  }

  const normalized = toCachedPerformer(fetched);
  const updated_at = new Date().toISOString();

  try {
    await cache.upsertPerformer({
      ...normalized,
      updated_at,
    });
  } catch (error) {
    console.error(`Failed to cache performer ${id}`, error);
  }

  return {
    ...normalized,
    updated_at,
  };
}
