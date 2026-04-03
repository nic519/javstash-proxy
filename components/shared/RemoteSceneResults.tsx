'use client';

import Image from 'next/image';
import type { KeyboardEvent, ReactNode } from 'react';
import {
  AlertCircle,
  CalendarDays,
  Clapperboard,
  Frown,
  Hash,
  Image as ImageIcon,
  Search,
  Tags,
  Users,
} from 'lucide-react';
import { sceneToTranslation } from './sceneToTranslation';
import type { Translation } from './types';
import {
  formatDate,
  getPerformerNames,
  parseSceneData,
  getStudioName,
  getTagColor,
} from './detail-modal/helpers';
import type { SceneData } from '@/src/graphql/queries';

interface RemoteSceneResultsProps {
  results: SceneData[];
  localResults?: Translation[];
  loading: boolean;
  error: string;
  keyword: string;
  source?: 'local' | 'remote' | null;
  onItemClick: (item: Translation) => void;
}

/**
 * 远程场景搜索结果区域
 * 负责渲染加载、错误、初始空状态、无结果和结果列表
 */
export function RemoteSceneResults({
  results,
  localResults = [],
  loading,
  error,
  keyword,
  source = 'remote',
  onItemClick,
}: RemoteSceneResultsProps) {
  const normalizedKeyword = keyword.trim();
  const showingLocalResults = source === 'local';
  const localScenes = localResults.map((item) => ({
    item,
    scene: item.rawResponse ? parseSceneData(item.rawResponse) : null,
  }));
  const showResults = showingLocalResults ? localScenes.length > 0 : results.length > 0;
  const showInitialState = !showResults && !loading && !normalizedKeyword && !error;
  const showNoResultsState = !showResults && !loading && normalizedKeyword && !error;

  return (
    <div>
      {error && (
        <div
          className="mb-8 p-4 rounded-xl flex items-center gap-3 animate-fade-in"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#fca5a5',
          }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showResults ? (
        <div className="space-y-4">
          {showingLocalResults
            ? localScenes.map(({ item, scene }, index) => (
                <div
                  key={item.code}
                  style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
                >
                  <RemoteSceneCard item={item} scene={scene} onClick={onItemClick} />
                </div>
              ))
            : results.map((scene, index) => {
                const item = sceneToTranslation(scene);
                return (
                  <div
                    key={scene.id}
                    style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
                  >
                    <RemoteSceneCard item={item} scene={scene} onClick={onItemClick} />
                  </div>
                );
              })}
        </div>
      ) : showNoResultsState ? (
        <div className="text-center py-20 animate-fade-in">
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            <Frown className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="text-xl font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            未找到相关结果
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            请尝试其他关键词或检查输入
          </p>
        </div>
      ) : showInitialState ? (
        <div className="text-center py-20 animate-fade-in">
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))',
              border: '1px solid rgba(212, 175, 55, 0.2)',
            }}
          >
            <Search className="w-10 h-10" style={{ color: 'var(--accent-gold)' }} />
          </div>
          <p className="text-xl font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            开始搜索
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            输入番号、演员名或关键词来搜索内容
          </p>
        </div>
      ) : null}
    </div>
  );
}

function RemoteSceneCard({
  item,
  scene,
  onClick,
}: {
  item: Translation;
  scene: SceneData | null;
  onClick: (item: Translation) => void;
}) {
  const releaseDate = formatDate(scene?.date || item.updatedAt) || '-';
  const studioName = getStudioName(scene) || '-';
  const performerNames = getPerformerNames(scene);
  const tagNames = Array.isArray(scene?.tags)
    ? scene.tags.map((tag) => tag.name?.trim()).filter((tag): tag is string => Boolean(tag)).slice(0, 8)
    : [];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(item)}
      onKeyDown={(event) => handleActivationKeyDown(event, () => onClick(item))}
      className="glass-card group animate-fade-in cursor-pointer overflow-hidden rounded-[28px] border p-5 transition-colors"
      style={{
        borderColor: 'rgba(212, 175, 55, 0.12)',
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))',
      }}
    >
      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="lg:w-[340px] lg:flex-shrink-0">
          <div
            className="relative aspect-[3/2] overflow-hidden rounded-2xl"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            {item.coverUrl ? (
              <Image
                src={item.coverUrl}
                alt={item.code}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 340px"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="h-10 w-10" style={{ color: 'var(--text-muted)' }} />
              </div>
            )}
            <div
              className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.42), transparent)' }}
            />
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {scene?.director ? (
              <MetaPill icon={<Clapperboard className="h-4 w-4" />} value={`导演 ${scene.director}`} />
            ) : null}

            <div
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2"
              style={{
                background: 'rgba(212, 175, 55, 0.08)',
                border: '1px solid rgba(212, 175, 55, 0.18)',
                color: 'var(--accent-gold)',
              }}
            >
              <Hash className="h-4 w-4" />
              <span className="font-mono text-sm">{item.code}</span>
            </div>

            <MetaPill icon={<CalendarDays className="h-4 w-4" />} value={releaseDate} />
            <MetaPill icon={<Tags className="h-4 w-4" />} value={studioName} />
          </div>

          <div className="space-y-2">
            <h3
              className="text-xl font-semibold leading-tight transition-colors duration-200 group-hover:text-[var(--accent-gold)]"
              style={{ color: 'var(--text-primary)' }}
            >
              {item.titleZh || item.code}
            </h3>
            <p
              className="text-sm leading-7 whitespace-pre-wrap"
              style={{ color: 'var(--text-secondary)' }}
            >
              {item.summaryZh || '-'}
            </p>
          </div>

          {performerNames.length > 0 ? (
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                <Users className="h-4 w-4" />
              </span>
              <p
                className="min-w-0 flex-1 truncate text-sm"
                style={{ color: 'var(--accent-gold)' }}
                title={performerNames.join(' / ')}
              >
                演员 {performerNames.join(' / ')}
              </p>
            </div>
          ) : null}

          {tagNames.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tagNames.map((tagName) => {
                const tagColor = getTagColor(tagName);

                return (
                  <span
                    key={tagName}
                    className="inline-flex rounded-md border px-2.5 py-1 text-xs"
                    style={{
                      background: tagColor.background,
                      color: tagColor.color,
                      borderColor: tagColor.border,
                    }}
                  >
                    {tagName}
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MetaPill({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-subtle)',
        color: 'var(--text-primary)',
      }}
    >
      <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
      <span>{value}</span>
    </div>
  );
}

function handleActivationKeyDown(
  event: KeyboardEvent<HTMLElement>,
  activate: () => void
) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    activate();
  }
}
