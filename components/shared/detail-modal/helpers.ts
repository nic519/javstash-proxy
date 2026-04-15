import type { PerformerData, SceneData } from '@/src/graphql/queries';

export interface DetailHeaderMetaItem {
  key: 'code' | 'director' | 'date' | 'studio';
  label: string;
  value: string;
}

export type PerformerPanelStatus = 'idle' | 'loading' | 'ready' | 'missing' | 'error';

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

export function formatDate(dateStr?: string): string | null {
  if (!dateStr) return null;

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }

  return date.toLocaleDateString('zh-CN');
}

export function getPerformerNames(rawData: SceneData | null): string[] {
  if (!Array.isArray(rawData?.performers)) return [];

  return rawData.performers
    .map((entry) => entry.performer?.name?.trim())
    .filter((name): name is string => Boolean(name));
}

function isPresent(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined;
}

export function performerHasExtraDetails(performer?: PerformerData | null): boolean {
  if (!performer) return false;

  return [
    performer.aliases,
    performer.birth_date,
    performer.height,
    performer.cup_size,
    performer.band_size,
    performer.waist_size,
    performer.hip_size,
    performer.career_start_year,
    performer.career_end_year,
    performer.images?.find((image) => isPresent(image?.url))?.url,
  ].some(isPresent);
}

export function calculatePerformerAgeAtSceneDate(
  birthDate?: string | null,
  sceneDate?: string | null
): number | null {
  if (!birthDate?.trim() || !sceneDate?.trim()) return null;

  const birth = new Date(birthDate);
  const scene = new Date(sceneDate);

  if (Number.isNaN(birth.getTime()) || Number.isNaN(scene.getTime())) {
    return null;
  }

  let age = scene.getUTCFullYear() - birth.getUTCFullYear();
  const monthDelta = scene.getUTCMonth() - birth.getUTCMonth();

  if (monthDelta < 0 || (monthDelta === 0 && scene.getUTCDate() < birth.getUTCDate())) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

export function formatPerformerMeasurements(performer?: PerformerData | null): string | null {
  if (!performer) return null;

  const parts: string[] = [];
  const chest = `${performer.cup_size?.trim() ?? ''}${performer.band_size ?? ''}`.trim();

  if (chest) {
    parts.push(chest);
  }
  if (isPresent(performer.waist_size)) {
    parts.push(`W${performer.waist_size}`);
  }
  if (isPresent(performer.hip_size)) {
    parts.push(`H${performer.hip_size}`);
  }

  return parts.length > 0 ? parts.join(' / ') : null;
}

export function formatPerformerCareer(performer?: PerformerData | null): string | null {
  if (!performer) return null;

  const start = performer.career_start_year;
  const end = performer.career_end_year;

  if (!isPresent(start) && !isPresent(end)) return null;
  if (isPresent(start) && isPresent(end)) return `${start} - ${end}`;
  if (isPresent(start)) return `${start} - 至今`;

  return `至 ${end}`;
}

export function getPerformerPanelFallback(status: PerformerPanelStatus): string {
  if (status === 'loading') {
    return '正在获取演员资料...';
  }

  if (status === 'error') {
    return '获取演员资料失败';
  }

  return '暂无演员资料';
}

export function getPerformerImageUrl(performer?: PerformerData | null): string | null {
  if (!performer?.images?.length) return null;

  const image = performer.images.find((entry) => typeof entry?.url === 'string' && entry.url.trim());

  return image?.url?.trim() || null;
}

export async function hydrateMissingPerformerDetails(
  rawData: SceneData | null,
  fetchPerformerById: (id: string) => Promise<PerformerData | null>
): Promise<SceneData | null> {
  if (!rawData || !Array.isArray(rawData.performers) || rawData.performers.length === 0) {
    return rawData;
  }

  const missingIds = rawData.performers
    .map((entry) => entry.performer)
    .filter((performer): performer is PerformerData => Boolean(performer?.id))
    .filter((performer) => !performerHasExtraDetails(performer))
    .map((performer) => performer.id as string);

  if (missingIds.length === 0) {
    return rawData;
  }

  const fetchedEntries = await Promise.all(
    [...new Set(missingIds)].map(async (id) => [id, await fetchPerformerById(id)] as const)
  );
  const fetchedById = new Map(
    fetchedEntries.filter((entry): entry is readonly [string, PerformerData] => Boolean(entry[1]))
  );

  if (fetchedById.size === 0) {
    return rawData;
  }

  return {
    ...rawData,
    performers: rawData.performers.map((entry) => {
      const performer = entry.performer;
      const performerId = performer?.id;

      if (!performerId || !fetchedById.has(performerId)) {
        return entry;
      }

      return {
        ...entry,
        performer: {
          ...fetchedById.get(performerId),
          ...performer,
          aliases: performer?.aliases?.length ? performer.aliases : fetchedById.get(performerId)?.aliases,
          urls: performer?.urls?.length ? performer.urls : fetchedById.get(performerId)?.urls,
          images: performer?.images?.length ? performer.images : fetchedById.get(performerId)?.images,
        },
      };
    }),
  };
}

export function getStudioName(rawData: SceneData | null): string | null {
  return rawData?.studio &&
    typeof rawData.studio === 'object' &&
    'name' in rawData.studio &&
    typeof rawData.studio.name === 'string'
    ? rawData.studio.name
    : null;
}

export function getDetailHeaderMeta({
  code,
  director,
  releaseDate,
  studioName,
}: {
  code: string;
  director?: string | null;
  releaseDate?: string | null;
  studioName?: string | null;
}) {
  const items: DetailHeaderMetaItem[] = [{ key: 'code', label: '', value: code }];

  if (releaseDate?.trim()) {
    items.push({ key: 'date', label: '', value: releaseDate.trim() });
  }

  if (studioName?.trim()) {
    items.push({ key: 'studio', label: '', value: studioName.trim() });
  }
  if (director?.trim()) {
    items.push({ key: 'director', label: '', value: director.trim() });
  }

  return items;
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
