import type { SceneData } from '@/src/graphql/queries';
import type { Translation } from '../types';

export const TAG_COLOR_PALETTE = [
  { background: 'rgba(239, 68, 68, 0.18)', color: '#fecaca', border: 'rgba(248, 113, 113, 0.28)' },
  { background: 'rgba(249, 115, 22, 0.18)', color: '#fed7aa', border: 'rgba(251, 146, 60, 0.28)' },
  { background: 'rgba(245, 158, 11, 0.18)', color: '#fde68a', border: 'rgba(250, 204, 21, 0.28)' },
  { background: 'rgba(132, 204, 22, 0.18)', color: '#d9f99d', border: 'rgba(163, 230, 53, 0.28)' },
  { background: 'rgba(34, 197, 94, 0.18)', color: '#bbf7d0', border: 'rgba(74, 222, 128, 0.28)' },
  { background: 'rgba(16, 185, 129, 0.18)', color: '#a7f3d0', border: 'rgba(52, 211, 153, 0.28)' },
  { background: 'rgba(20, 184, 166, 0.18)', color: '#99f6e4', border: 'rgba(45, 212, 191, 0.28)' },
  { background: 'rgba(6, 182, 212, 0.18)', color: '#a5f3fc', border: 'rgba(34, 211, 238, 0.28)' },
  { background: 'rgba(14, 165, 233, 0.18)', color: '#bae6fd', border: 'rgba(56, 189, 248, 0.28)' },
  { background: 'rgba(59, 130, 246, 0.18)', color: '#bfdbfe', border: 'rgba(96, 165, 250, 0.28)' },
  { background: 'rgba(99, 102, 241, 0.18)', color: '#c7d2fe', border: 'rgba(129, 140, 248, 0.28)' },
  { background: 'rgba(139, 92, 246, 0.18)', color: '#ddd6fe', border: 'rgba(167, 139, 250, 0.28)' },
  { background: 'rgba(168, 85, 247, 0.18)', color: '#e9d5ff', border: 'rgba(192, 132, 252, 0.28)' },
  { background: 'rgba(217, 70, 239, 0.18)', color: '#f5d0fe', border: 'rgba(232, 121, 249, 0.28)' },
  { background: 'rgba(236, 72, 153, 0.18)', color: '#fbcfe8', border: 'rgba(244, 114, 182, 0.28)' },
  { background: 'rgba(244, 63, 94, 0.18)', color: '#fecdd3', border: 'rgba(251, 113, 133, 0.28)' },
  { background: 'rgba(251, 113, 133, 0.16)', color: '#ffe4e6', border: 'rgba(253, 164, 175, 0.26)' },
  { background: 'rgba(250, 204, 21, 0.16)', color: '#fef3c7', border: 'rgba(253, 224, 71, 0.26)' },
  { background: 'rgba(45, 212, 191, 0.16)', color: '#ccfbf1', border: 'rgba(94, 234, 212, 0.26)' },
  { background: 'rgba(96, 165, 250, 0.16)', color: '#dbeafe', border: 'rgba(147, 197, 253, 0.26)' },
] as const;

export function parseSceneData(jsonStr: string): SceneData | null {
  try {
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? null : (parsed as SceneData);
  } catch {
    return null;
  }
}

export function mergeHydratedTranslation(item: Translation, rawResponse: string): Translation {
  return {
    ...item,
    rawResponse,
  };
}

export function formatDate(dateStr?: string): string | null {
  if (!dateStr) return null;

  try {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  } catch {
    return dateStr;
  }
}

export function getPerformerNames(rawData: SceneData | null): string[] {
  if (!Array.isArray(rawData?.performers)) return [];

  return rawData.performers
    .map((entry) => entry.performer?.name?.trim())
    .filter((name): name is string => Boolean(name));
}

export function getStudioName(rawData: SceneData | null): string | null {
  return rawData?.studio &&
    typeof rawData.studio === 'object' &&
    'name' in rawData.studio &&
    typeof rawData.studio.name === 'string'
    ? rawData.studio.name
    : null;
}

function hashTagName(tagName: string): number {
  let hash = 0;

  for (let i = 0; i < tagName.length; i += 1) {
    hash = (hash * 31 + tagName.charCodeAt(i)) >>> 0;
  }

  return hash;
}

export function getTagColor(tagName: string) {
  return TAG_COLOR_PALETTE[hashTagName(tagName) % TAG_COLOR_PALETTE.length];
}
