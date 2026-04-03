'use client';

import Image from 'next/image';
import type { KeyboardEvent } from 'react';
import type { ItemCardProps, Translation } from './types';

/**
 * 通用 ItemCard 组件
 * 支持表格行和卡片两种显示样式
 */
export function ItemCard({ item, variant, onClick }: ItemCardProps) {
  if (variant === 'table') {
    return <TableRow item={item} onClick={onClick} />;
  }
  if (variant === 'grid') {
    return <GridCard item={item} onClick={onClick} />;
  }
  return <CardView item={item} onClick={onClick} />;
}

/**
 * 表格行样式
 * 紧凑的单行布局，显示 code、titleZh、summaryZh
 */
function TableRow({ item, onClick }: { item: Translation; onClick: (item: Translation) => void }) {
  return (
    <tr
      onClick={() => onClick(item)}
      className="cursor-pointer transition-colors hover:bg-[var(--bg-tertiary)]"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      {/* 代码列 */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClick(item);
            }}
            className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:ml-0 focus:inline-flex focus:items-center focus:rounded-md focus:border focus:px-2 focus:py-0.5 focus:text-[11px] focus:font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] focus:ring-offset-2 focus:ring-offset-transparent"
            style={{
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
            aria-label={`Open ${item.code}`}
          >
            Open
          </button>
          <span className="font-mono whitespace-nowrap" style={{ color: 'var(--accent-gold)' }}>
            {item.code}
          </span>
        </div>
      </td>
      {/* 标题列 */}
      <td className="px-3 py-2 max-w-xs">
        <p className="truncate" style={{ color: 'var(--text-primary)' }}>
          {item.titleZh || '-'}
        </p>
      </td>
      {/* 简介列 - 大屏幕可见 */}
      <td className="px-3 py-2 hidden max-w-md lg:table-cell">
        <p className="truncate" style={{ color: 'var(--text-secondary)' }}>
          {item.summaryZh || '-'}
        </p>
      </td>
    </tr>
  );
}

/**
 * 卡片样式
 * 显示封面、code、titleZh、summaryZh 等
 */
function CardView({ item, onClick }: { item: Translation; onClick: (item: Translation) => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(item)}
      onKeyDown={(event) => handleActivationKeyDown(event, () => onClick(item))}
      className="glass-card group animate-fade-in flex gap-5 p-5 cursor-pointer"
    >
      {/* 封面图片 */}
      {item.coverUrl && (
        <div className="image-hover w-[400px] h-[240px] rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={item.coverUrl}
            alt={item.code}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 内容区域 */}
      <div className="flex-1 min-w-0">
        {/* Code Badge & Date */}
        <div className="flex items-center gap-3 mb-2">
          <span className="tag">{item.code}</span>
          {item.updatedAt && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {formatDate(item.updatedAt)}
            </span>
          )}
        </div>

        {/* 标题 */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-1 transition-colors duration-200 group-hover:text-[var(--accent-gold)]">
          {item.titleZh || '无标题'}
        </h3>

        {/* 简介 */}
        {item.summaryZh && (
          <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {item.summaryZh}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * 网格卡片样式
 * 显示封面和标题，适合管理后台的紧凑网格视图
 */
function GridCard({ item, onClick }: { item: Translation; onClick: (item: Translation) => void }) {
  const performers = getPerformers(item.rawResponse);

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className="glass-card group overflow-hidden rounded-2xl p-0 text-left cursor-pointer"
    >
      <div
        className="relative aspect-[3/4] w-full overflow-hidden flex items-center justify-center"
        style={{ background: 'var(--bg-tertiary)' }}
      >
        {item.coverUrl ? (
          <Image
            src={item.coverUrl}
            alt={item.code}
            fill
            unoptimized
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
            className="object-cover object-right origin-right transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="px-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            No Cover
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="mb-1 text-[11px] font-mono uppercase tracking-[0.18em]" style={{ color: 'var(--accent-gold)' }}>
          {item.code}
        </p>
        <h3 className="text-sm font-medium line-clamp-2" style={{ color: 'var(--text-primary)' }}>
          {item.titleZh || item.code}
        </h3>
        {performers.length > 0 && (
          <p className="mt-2 text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {performers.join(' / ')}
          </p>
        )}
      </div>
    </button>
  );
}

/**
 * 格式化日期
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }
  return date.toLocaleDateString('zh-CN');
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

function getPerformers(rawResponse?: string): string[] {
  if (!rawResponse) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawResponse) as {
      performers?: Array<{ performer?: { name?: string } }>;
    };

    if (!Array.isArray(parsed.performers)) {
      return [];
    }

    return parsed.performers
      .map((entry) => entry.performer?.name?.trim())
      .filter((name): name is string => Boolean(name))
      .slice(0, 2);
  } catch {
    return [];
  }
}
