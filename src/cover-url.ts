import type { SceneData } from './graphql/queries';

// 这类地址通常是内网或无效封面地址，需要在后续流程中尝试替换。
const BAD_COVER_PREFIX = 'http://192';

/**
 * 判断当前封面地址是否属于应被替换的无效地址。
 */
export function isBadCoverUrl(coverUrl?: string): boolean {
  return typeof coverUrl === 'string' && coverUrl.startsWith(BAD_COVER_PREFIX);
}

/**
 * 从场景对象的图片列表里提取第一个可用封面地址。
 */
export function extractCoverUrlFromScene(scene: Pick<SceneData, 'images'> | null | undefined): string | undefined {
  if (!scene || !Array.isArray(scene.images)) {
    return undefined;
  }

  for (const image of scene.images) {
    if (image && typeof image.url === 'string' && image.url.trim()) {
      return image.url.trim();
    }
  }

  return undefined;
}

/**
 * 从缓存的原始响应 JSON 中恢复封面地址。
 */
export function extractCoverUrlFromRawResponse(rawResponse?: string): string | undefined {
  if (typeof rawResponse !== 'string' || !rawResponse.trim()) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(rawResponse) as SceneData | SceneData[];
    if (!parsed || Array.isArray(parsed)) {
      return undefined;
    }

    return extractCoverUrlFromScene(parsed);
  } catch {
    return undefined;
  }
}
