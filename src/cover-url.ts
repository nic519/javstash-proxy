import type { SceneData } from './graphql/queries';

const BAD_COVER_PREFIX = 'http://192';

export function isBadCoverUrl(coverUrl?: string): boolean {
  return typeof coverUrl === 'string' && coverUrl.startsWith(BAD_COVER_PREFIX);
}

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
