'use client';

import { useState, type MouseEvent } from 'react';
import { Hash, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { PerformerData } from '@/src/graphql/queries';
import {
  calculatePerformerAgeAtSceneDate,
  formatDate,
  formatPerformerCareer,
  formatPerformerMeasurements,
  getPerformerPanelFallback,
  type PerformerPanelStatus,
} from './detail-modal/helpers';

export async function copySceneCode(code: string) {
  await navigator.clipboard.writeText(code);
  toast.success('番号已复制', {
    id: `scene-copy-${code}`,
  });
}

export async function copyPerformerName(name: string) {
  await navigator.clipboard.writeText(name);
  toast.success('演员已复制', {
    id: `performer-copy-${name}`,
  });
}

export function CopyableCode({
  code,
  variant = 'pill',
  copied,
  onCopy,
  stopPropagation = true,
}: {
  code: string;
  variant?: 'detail' | 'pill' | 'inline';
  copied?: boolean;
  onCopy?: () => void | Promise<void>;
  stopPropagation?: boolean;
}) {
  const [internalCopied, setInternalCopied] = useState(false);
  const isCopied = copied ?? internalCopied;

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (onCopy) {
      await onCopy();
      return;
    }

    await copySceneCode(code);
    setInternalCopied(true);
    window.setTimeout(() => setInternalCopied(false), 2000);
  };

  if (variant === 'detail') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex min-w-0 items-center gap-2 rounded-lg transition-opacity hover:opacity-80 xl:flex-1"
        style={{ color: 'var(--text-primary)' }}
        title="点击复制番号"
      >
        <Hash
          className="h-4 w-4 flex-shrink-0"
          style={{ color: 'var(--text-muted)' }}
          aria-hidden="true"
        />
        <span
          className="min-w-0 font-mono text-sm sm:text-[15px]"
          style={{ color: isCopied ? '#86efac' : 'var(--accent-gold)' }}
        >
          {code}
        </span>
      </button>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="font-mono whitespace-nowrap transition-opacity hover:opacity-80"
        style={{ color: isCopied ? '#86efac' : 'var(--accent-gold)' }}
        title="点击复制番号"
      >
        {code}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 transition-opacity hover:opacity-80"
      style={{
        background: 'rgba(212, 175, 55, 0.08)',
        border: '1px solid rgba(212, 175, 55, 0.18)',
        color: isCopied ? '#86efac' : 'var(--accent-gold)',
      }}
      title="点击复制番号"
    >
      <Hash className="h-4 w-4" aria-hidden="true" />
      <span className="font-mono text-sm">{code}</span>
    </button>
  );
}

export function PerformerList({
  names,
  performers,
  performerStatusById,
  variant = 'detail',
  maxVisibleNames,
  sceneDate,
}: {
  names: string[];
  performers?: PerformerData[];
  performerStatusById?: Record<string, PerformerPanelStatus>;
  variant?: 'detail' | 'row' | 'compact';
  maxVisibleNames?: number;
  sceneDate?: string | null;
}) {
  if (names.length === 0) return null;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const performerItems = names.map((name, index) => ({
    name,
    performer: performers?.[index],
  }));
  const visiblePerformers = typeof maxVisibleNames === 'number'
    ? performerItems.slice(0, maxVisibleNames)
    : performerItems;
  const hasOverflow = visiblePerformers.length < performerItems.length;
  const hoveredPerformer = hoveredIndex !== null ? visiblePerformers[hoveredIndex] : null;
  const hoveredStatus = hoveredPerformer?.performer?.id
    ? performerStatusById?.[hoveredPerformer.performer.id] ?? (hasHoverData(hoveredPerformer.performer, sceneDate) ? 'ready' : 'idle')
    : hasHoverData(hoveredPerformer?.performer, sceneDate)
      ? 'ready'
      : 'idle';
  const hoveredAge = calculatePerformerAgeAtSceneDate(hoveredPerformer?.performer?.birth_date, sceneDate);
  const hoveredMeasurements = formatPerformerMeasurements(hoveredPerformer?.performer);
  const hoveredBirthDate = hoveredPerformer?.performer?.birth_date
    ? formatDate(hoveredPerformer.performer.birth_date)
    : null;
  const hoveredCareer = formatPerformerCareer(hoveredPerformer?.performer);
  const hoveredAliases = hoveredPerformer?.performer?.aliases?.filter(Boolean).join(' / ') || null;
  const hoveredHeight = hoveredPerformer?.performer?.height ? `${hoveredPerformer.performer.height} cm` : null;
  const hasHoveredDetails = Boolean(
    hoveredAge !== null ||
    hoveredMeasurements ||
    hoveredBirthDate ||
    hoveredAliases ||
    hoveredCareer ||
    hoveredHeight
  );

  const handlePerformerClick = async (
    event: MouseEvent<HTMLButtonElement>,
    name: string
  ) => {
    event.preventDefault();
    event.stopPropagation();
    await copyPerformerName(name);
  };

  if (variant === 'compact') {
    return (
      <div className="mt-2">
        <div
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"
          style={{ color: 'var(--accent-gold)' }}
        >
          {visiblePerformers.map(({ name }, index) => (
            <div key={`${name}-${index}`} className="flex items-center gap-2">
              {index > 0 ? (
                <span
                  className="h-2.5 w-px rounded-full"
                  style={{ background: 'rgba(212,175,55,0.22)' }}
                  aria-hidden="true"
                />
              ) : null}
              <button
                type="button"
                onClick={(event) => handlePerformerClick(event, name)}
                className="whitespace-nowrap transition-opacity hover:opacity-80"
                title="点击复制演员"
              >
                {name}
              </button>
            </div>
          ))}
          {hasOverflow ? <span aria-hidden="true">...</span> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
      <div className="flex items-center gap-2.5 pt-0.5">
        <Users
          className="h-4 w-4 flex-shrink-0"
          style={{ color: 'var(--text-muted)' }}
          aria-hidden="true"
        />
        <span
          className="whitespace-nowrap text-sm leading-6 tracking-[0.08em]"
          style={{ color: 'var(--text-muted)' }}
        >
          演员
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div
          className={variant === 'row'
            ? 'flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-6'
            : 'flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] leading-6'}
          style={{ color: 'var(--accent-gold)' }}
        >
        {visiblePerformers.map(({ name, performer }, index) => {
          return (
          <div key={`${name}-${index}`} className="flex items-center gap-3">
            {index > 0 && (
              <span
                className="h-3 w-px rounded-full"
                style={{ background: 'rgba(212,175,55,0.22)' }}
                aria-hidden="true"
              />
            )}
            <button
              type="button"
              onClick={(event) => handlePerformerClick(event, name)}
              className="whitespace-nowrap transition-opacity hover:opacity-80"
              title="点击复制演员"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex((current) => (current === index ? null : current))}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex((current) => (current === index ? null : current))}
            >
              {name}
            </button>
          </div>
        )})}
        {hasOverflow ? <span aria-hidden="true">...</span> : null}
        </div>
        {variant === 'detail' && hoveredPerformer ? (
          <div
            className="rounded-2xl border p-3 text-sm shadow-2xl"
            style={{
              background: 'rgba(15, 15, 20, 0.96)',
              borderColor: 'rgba(212,175,55,0.18)',
              color: 'var(--text-primary)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="mb-2 text-[13px]" style={{ color: 'var(--accent-gold)' }}>
              {hoveredPerformer.name}
            </div>
            {hasHoveredDetails ? (
              <div className="space-y-1.5">
                {hoveredAge !== null ? (
                  <p><span style={{ color: 'var(--text-muted)' }}>拍摄年龄</span>{' '}{hoveredAge} 岁</p>
                ) : null}
                {hoveredMeasurements ? (
                  <p><span style={{ color: 'var(--text-muted)' }}>三围</span>{' '}{hoveredMeasurements}</p>
                ) : null}
                {hoveredBirthDate ? (
                  <p><span style={{ color: 'var(--text-muted)' }}>生日</span>{' '}{hoveredBirthDate}</p>
                ) : null}
                {hoveredHeight ? (
                  <p><span style={{ color: 'var(--text-muted)' }}>身高</span>{' '}{hoveredHeight}</p>
                ) : null}
                {hoveredCareer ? (
                  <p><span style={{ color: 'var(--text-muted)' }}>Career</span>{' '}{hoveredCareer}</p>
                ) : null}
                {hoveredAliases ? (
                  <p className="whitespace-normal break-words"><span style={{ color: 'var(--text-muted)' }}>Aliases</span>{' '}{hoveredAliases}</p>
                ) : null}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>{getPerformerPanelFallback(hoveredStatus)}</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function hasHoverData(performer?: PerformerData | null, sceneDate?: string | null) {
  if (!performer) return false;

  return Boolean(
    calculatePerformerAgeAtSceneDate(performer.birth_date, sceneDate) !== null ||
    formatPerformerMeasurements(performer) ||
    (performer.birth_date ? formatDate(performer.birth_date) : null) ||
    performer.aliases?.filter(Boolean).length ||
    formatPerformerCareer(performer) ||
    performer.height
  );
}
