import type { Translation } from './types';
import type { SceneData } from '@/src/graphql/queries';

/**
 * 将 GraphQL Scene 数据转换为 Translation 类型
 */
export function sceneToTranslation(scene: SceneData): Translation {
  return {
    code: scene.code,
    titleZh: scene.title || '',
    summaryZh: scene.details || '',
    coverUrl: scene.images?.[0]?.url,
    rawResponse: JSON.stringify(scene),
    updatedAt: scene.updated,
  };
}
