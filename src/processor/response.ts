import type { SceneNode, Translation } from '../types';
import type { TursoCache } from '../cache/turso';
import type { DeepLXTranslator } from '../translator/deeplx';

/**
 * Extract scene nodes from GraphQL response
 */
export function extractScenes(data: unknown): SceneNode[] {
  const results: SceneNode[] = [];

  function traverse(obj: unknown): void {
    if (!obj || typeof obj !== 'object') return;

    if (Array.isArray(obj)) {
      obj.forEach(traverse);
      return;
    }

    const record = obj as Record<string, unknown>;

    // Check if this is a scene node (has code and title/details)
    if (record.code && (record.title || record.details)) {
      // Extract cover URL from images array
      let coverUrl: string | undefined;
      const images = record.images;
      if (Array.isArray(images) && images.length > 0 && images[0]?.url) {
        coverUrl = images[0].url as string;
      }

      results.push({
        code: record.code as string,
        title: record.title as string | undefined,
        details: record.details as string | undefined,
        coverUrl,
      });
    }

    // Recursively traverse children
    Object.values(record).forEach(traverse);
  }

  traverse(data);
  return results;
}

/**
 * Process GraphQL response: translate and cache
 */
export async function processResponse(
  data: unknown,
  cache: TursoCache,
  translator: DeepLXTranslator
): Promise<unknown> {
  const scenes = extractScenes(data);

  if (scenes.length === 0) {
    return data;
  }

  // Batch query cache
  const codes = scenes.map((s) => s.code).filter(Boolean) as string[];
  const cached = await cache.getTranslations(codes);
  const cachedMap = new Map(cached.map((t) => [t.code, t]));

  // Translate missing items
  const toTranslate = scenes.filter((s) => s.code && !cachedMap.has(s.code));

  if (toTranslate.length > 0) {
    const translations = await translator.translateBatch(toTranslate);
    await cache.saveBatch(translations);
    translations.forEach((t) => cachedMap.set(t.code, t));
  }

  // Replace in-place
  replaceInPlace(data, cachedMap);

  return data;
}

/**
 * Recursively replace title/details in response
 */
function replaceInPlace(data: unknown, translations: Map<string, Translation>): void {
  if (!data || typeof data !== 'object') return;

  if (Array.isArray(data)) {
    data.forEach((item) => replaceInPlace(item, translations));
    return;
  }

  const record = data as Record<string, unknown>;

  if (record.code && translations.has(record.code as string)) {
    const t = translations.get(record.code as string)!;
    record.title = t.titleZh;
    record.details = t.summaryZh;
  }

  Object.values(record).forEach((val) => replaceInPlace(val, translations));
}