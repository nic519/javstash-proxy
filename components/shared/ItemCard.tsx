'use client';

import type { Translation, ItemCardVariant } from './types';

interface ItemCardProps {
  item: Translation;
  variant: ItemCardVariant;
  onClick: (item: Translation) => void;
}

/**
 * 通用 ItemCard 组件
 * 支持表格行和卡片两种显示样式
 */
export function ItemCard({ item, variant, onClick }: ItemCardProps) {
  if (variant === 'table') {
    return <TableRow item={item} onClick={onClick} />;
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
        <span className="font-mono whitespace-nowrap" style={{ color: 'var(--accent-gold)' }}>
          {item.code}
        </span>
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
      onClick={() => onClick(item)}
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
 * 格式化日期
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN');
  } catch {
    return dateStr;
  }
}
