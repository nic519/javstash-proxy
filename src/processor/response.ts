import type { SceneNode, Translation, GraphQLRequest } from '../types';
import type { TursoCache } from '../cache/turso';
import type { DeepLXTranslator } from '../translator/deeplx';

/**
 * Extract scene codes from GraphQL request variables
 * Looks for common patterns like 'codes', 'code', 'filter.codes', etc.
 */
export function extractCodesFromRequest(request: GraphQLRequest): string[] {
  const codes: string[] = [];
  const variables = request.variables;

  if (!variables || typeof variables !== 'object') return codes;

  function extractFromValue(value: unknown): void {
    if (typeof value === 'string') {
      // Check if it looks like a scene code (e.g., SSIS-001, ABC-123)
      if (/^[A-Z]{2,6}-\d{3,5}$/i.test(value)) {
        codes.push(value.toUpperCase());
      }
    } else if (Array.isArray(value)) {
      value.forEach(extractFromValue);
    } else if (value && typeof value === 'object') {
      Object.values(value).forEach(extractFromValue);
    }
  }

  // Common variable names that might contain codes
  const codeKeys = ['codes', 'code', 'scene_codes', 'sceneCodes', 'ids', 'id'];
  for (const key of codeKeys) {
    if (key in variables) {
      extractFromValue((variables as Record<string, unknown>)[key]);
    }
  }

  // Also check filter object
  if ('filter' in variables && typeof variables.filter === 'object' && variables.filter) {
    const filter = variables.filter as Record<string, unknown>;
    for (const key of codeKeys) {
      if (key in filter) {
        extractFromValue(filter[key]);
      }
    }
  }

  return [...new Set(codes)];
}

/**
 * Try to restore response entirely from cache
 * Returns null if cache is incomplete
 */
export async function tryRestoreFromCache(
  request: GraphQLRequest,
  cache: TursoCache
): Promise<unknown | null> {
  const codes = extractCodesFromRequest(request);

  if (codes.length === 0) {
    return null; // Cannot determine codes from request
  }

  // Check if all codes have raw_response cached
  const missingCodes = await cache.getMissingRawResponses(codes);
  if (missingCodes.length > 0) {
    return null; // Cache incomplete
  }

  // Get all cached translations
  const cached = await cache.getTranslations(codes);
  const cachedMap = new Map(cached.map((t) => [t.code, t]));

  // Build a response with translated content
  // Note: This creates a minimal response structure
  // The actual structure depends on the GraphQL query
  const scenes = codes.map((code) => {
    const t = cachedMap.get(code);
    if (!t?.rawResponse) return null;

    // Parse raw response and apply translations
    const rawScene = JSON.parse(t.rawResponse);
    return {
      ...rawScene,
      title: t.titleZh,
      details: t.summaryZh,
    };
  }).filter(Boolean);

  // Return in a generic structure
  // Note: This may not match all GraphQL query structures
  return {
    data: {
      findScenes: {
        scenes,
        count: scenes.length,
      },
    },
  };
}

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
 * Extract scene nodes with their raw JSON from GraphQL response
 */
export function extractScenesWithRaw(data: unknown): Array<{ scene: SceneNode; rawJson: string }> {
  const results: Array<{ scene: SceneNode; rawJson: string }> = [];

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
        scene: {
          code: record.code as string,
          title: record.title as string | undefined,
          details: record.details as string | undefined,
          coverUrl,
        },
        rawJson: JSON.stringify(record),
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
  const scenesWithRaw = extractScenesWithRaw(data);

  if (scenesWithRaw.length === 0) {
    return data;
  }

  // Batch query cache
  const codes = scenesWithRaw.map((s) => s.scene.code).filter(Boolean) as string[];
  const cached = await cache.getTranslations(codes);
  const cachedMap = new Map(cached.map((t) => [t.code, t]));

  // Separate scenes that need translation vs can be restored from cache
  const toTranslate: Array<{ scene: SceneNode; rawJson: string }> = [];
  const toRestore: Translation[] = [];

  for (const { scene, rawJson } of scenesWithRaw) {
    if (!scene.code) continue;

    const cachedItem = cachedMap.get(scene.code);
    if (cachedItem?.rawResponse) {
      // Has cached raw response, can restore directly
      toRestore.push(cachedItem);
    } else if (!cachedItem) {
      // Not in cache at all, need to translate and cache
      toTranslate.push({ scene, rawJson });
    } else {
      // Has translation but no raw response, update with raw response
      toTranslate.push({ scene, rawJson });
    }
  }

  // Translate new items
  if (toTranslate.length > 0) {
    const translations = await translator.translateBatch(toTranslate.map((t) => t.scene));
    // Add raw response to translations
    const translationsWithRaw = translations.map((t, i) => ({
      ...t,
      rawResponse: toTranslate[i].rawJson,
    }));
    await cache.saveBatch(translationsWithRaw);
    translationsWithRaw.forEach((t) => cachedMap.set(t.code, t));
  }

  // Restore from cache (replace with translated content)
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