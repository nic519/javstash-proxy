import type { SceneNode, Translation, GraphQLRequest } from '../types';
import type { TursoCache } from '../cache/turso';
import type { DeepLXTranslator } from '../translator/deeplx';
import { extractCoverUrlFromRawResponse, isBadCoverUrl } from '../cover-url';

/**
 * 从 GraphQL 请求变量中尽量提取场景编号。
 * 会兼容 `codes`、`code`、`filter.codes` 等常见字段形态。
 */
export function extractCodesFromRequest(request: GraphQLRequest): string[] {
  const codes: string[] = [];
  const variables = request.variables;

  if (!variables || typeof variables !== 'object') return codes;

  function extractFromValue(value: unknown): void {
    if (typeof value === 'string') {
      // 识别形如 SSIS-001、ABC-123 的片号格式。
      if (/^[A-Z]{2,6}-\d{3,5}$/i.test(value)) {
        codes.push(value.toUpperCase());
      }
    } else if (Array.isArray(value)) {
      value.forEach(extractFromValue);
    } else if (value && typeof value === 'object') {
      Object.values(value).forEach(extractFromValue);
    }
  }

  // 常见的片号字段名。
  const codeKeys = ['codes', 'code', 'scene_codes', 'sceneCodes', 'ids', 'id'];
  for (const key of codeKeys) {
    if (key in variables) {
      extractFromValue((variables as Record<string, unknown>)[key]);
    }
  }

  // 额外检查 filter 对象中的嵌套条件。
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
 * 尝试完全从缓存恢复响应。
 * 只要有任意片号缺少原始响应，就返回 null 交给上游继续处理。
 */
export async function tryRestoreFromCache(
  request: GraphQLRequest,
  cache: TursoCache
): Promise<unknown | null> {
  const codes = extractCodesFromRequest(request);

  if (codes.length === 0) {
    return null; // 无法从请求中判断片号，不能安全走缓存还原。
  }

  // 只有全部片号都拥有 raw_response 时，才能构造完整响应。
  const missingCodes = await cache.getMissingRawResponses(codes);
  if (missingCodes.length > 0) {
    return null; // 缓存不完整，回退到正常上游请求。
  }

  // 取出所有缓存翻译内容。
  const cached = await cache.getTranslations(codes);
  const cachedMap = new Map(cached.map((t) => [t.code, t]));

  // 构造一个最小可用响应结构，并把缓存中的中文标题/简介覆盖进去。
  const scenes = codes.map((code) => {
    const t = cachedMap.get(code);
    if (!t?.rawResponse) return null;

    // 还原原始场景对象，再套用缓存中的中文文本。
    const rawScene = JSON.parse(t.rawResponse);
    return {
      ...rawScene,
      title: t.titleZh,
      details: t.summaryZh,
    };
  }).filter(Boolean);

  // 这里返回的是通用结构，适合当前代理的主要使用场景。
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
 * 从 GraphQL 响应中递归提取场景节点。
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

    // 同时具备 code 和 title/details 时，视为一个场景节点。
    if (record.code && (record.title || record.details)) {
      // 顺手提取第一张封面图，后续缓存时可直接使用。
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

    // 继续递归处理嵌套字段。
    Object.values(record).forEach(traverse);
  }

  traverse(data);
  return results;
}

/**
 * 提取场景节点及其原始 JSON 文本。
 * 原始文本会进入缓存，用于后续直接还原响应。
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

    // 命中场景节点时，同时保存结构化数据和原始 JSON。
    if (record.code && (record.title || record.details)) {
      // 额外记录封面地址，后续可用来修正历史缓存中的坏链接。
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

    // 继续向下遍历整个响应树。
    Object.values(record).forEach(traverse);
  }

  traverse(data);
  return results;
}

/**
 * 处理 GraphQL 响应。
 * 主要流程：提取场景、查缓存、翻译缺失项、补齐原始响应，再把中文内容写回当前结果。
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

  // 批量读取缓存，减少数据库往返次数。
  const codes = scenesWithRaw.map((s) => s.scene.code).filter(Boolean) as string[];
  const cached = await cache.getTranslations(codes);
  const cachedMap = new Map(cached.map((t) => [t.code, t]));

  // 按缓存状态分类：需要翻译、只需补原始响应、可直接恢复。
  const toTranslate: Array<{ scene: SceneNode; rawJson: string }> = [];
  const toUpdateRaw: Array<{ scene: SceneNode; rawJson: string }> = [];
  const toRestore: Translation[] = [];

  for (const { scene, rawJson } of scenesWithRaw) {
    if (!scene.code) continue;

    const cachedItem = cachedMap.get(scene.code);
    if (cachedItem?.rawResponse) {
      // 翻译和原始响应都齐全，可以直接用于最终替换。
      toRestore.push(cachedItem);
    } else if (!cachedItem) {
      // 完全未命中缓存，需要翻译并持久化。
      toTranslate.push({ scene, rawJson });
    } else {
      // 已有翻译但缺少原始响应，只补缓存即可。
      toUpdateRaw.push({ scene, rawJson });
    }
  }

  // 翻译新增内容，并把原始响应一并写入缓存。
  if (toTranslate.length > 0) {
    const translations = await translator.translateBatch(toTranslate.map((t) => t.scene));
    const translationsWithRaw = translations.map((t, i) => ({
      ...t,
      rawResponse: toTranslate[i].rawJson,
    }));
    await cache.saveBatch(translationsWithRaw);
    translationsWithRaw.forEach((t) => cachedMap.set(t.code, t));
  }

  // 对已有翻译但缺 raw_response 的记录补齐原始数据。
  if (toUpdateRaw.length > 0) {
    for (const { scene, rawJson } of toUpdateRaw) {
      const cachedItem = cachedMap.get(scene.code!);
      const nextCoverUrl = extractCoverUrlFromRawResponse(rawJson);

      await cache.updateTranslation(scene.code!, {
        rawResponse: rawJson,
        coverUrl: cachedItem?.coverUrl && isBadCoverUrl(cachedItem.coverUrl) && nextCoverUrl
          ? nextCoverUrl
          : undefined,
      });

      // 同步更新内存中的缓存映射，确保本次请求也能拿到最新值。
      if (cachedItem) {
        cachedItem.rawResponse = rawJson;
        if (cachedItem.coverUrl && isBadCoverUrl(cachedItem.coverUrl) && nextCoverUrl) {
          cachedItem.coverUrl = nextCoverUrl;
        }
      }
    }
  }

  // 最后在当前响应对象上原地替换标题和简介。
  replaceInPlace(data, cachedMap);

  return data;
}

/**
 * 递归地把响应中的标题和简介替换为缓存中的中文内容。
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
