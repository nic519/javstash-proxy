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
  return <GridCard item={item} onClick={onClick} />;
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
 * 网格卡片样式
 * 显示封面和标题，适合管理后台的紧凑网格视图
 *
 * 这张卡片里，视觉变化最明显的部分就是封面图区域。
 * 如果你之后想调整“卡片看起来更高、更满、更聚焦主体”，可以优先看下面这几个点：
 * 1. 外层容器的 `aspect-[2.8/4]`
 *    这决定了卡片图片区域本身的宽高比。
 *    - 改成更“瘦高”的比例，图片区域会更高。
 *    - 改成更“宽短”的比例，图片区域会更扁。
 * 2. `Image` 的 `fill`
 *    这表示图片会直接贴满父容器的定位区域，本身不靠 `width/height` 决定显示尺寸。
 *    所以真正决定“显示框多大”的，不是 `Image`，而是外层这个 `relative` 容器。
 * 3. `object-cover`
 *    这是目前最关键的裁切策略。
 *    它会保证图片把容器铺满，但代价是图片可能被裁掉一部分。
 *    如果原图比例和卡片比例差很多，就会出现“左右或上下被切掉更多”的情况。
 * 4. `object-right`
 *    当前裁切锚点偏右，也就是裁切时会优先保留图片右侧内容。
 *    如果你发现人物/主体在中间或左边总被切掉，可以尝试：
 *    - 改成 `object-center`
 *    - 或改成 `object-left`
 * 5. `group-hover:scale-105`
 *    这是 hover 时轻微放大，会让卡片更有动感；
 *    但也会让边缘裁切再明显一点。
 *    如果你想更稳一点，可以降成 `scale-[1.02]` 或先临时去掉观察。
 */
function GridCard({ item, onClick }: { item: Translation; onClick: (item: Translation) => void }) {
  const performers = getPerformers(item.rawResponse);

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className="group overflow-hidden rounded-[26px] p-0 text-left cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.018))',
        boxShadow: '0 18px 40px rgba(0, 0, 0, 0.14), inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      <div
        // 封面图显示框：
        // - `relative` 是给内部 `Image fill` 提供定位基准。
        // - `aspect-[2.8/4]` 决定“封面区域”的基础比例，这里比标准 2:3 再稍微高一点。
        // - `overflow-hidden` 很重要，因为 `object-cover` 和 hover 放大都会超出边界，需要在这里裁掉。
        //
        // 推荐你的尝试顺序：
        // 1. 先改这里的 `aspect-[2.8/4]`，观察卡片整体高度是不是更接近你想要的比例。
        // 2. 再改图片的 `object-right / object-center`，看主体站位有没有更舒服。
        // 3. 最后再决定要不要动 hover 缩放和过渡速度。
        //
        // 如果你现在遇到的是“原始图片高度不足，看起来没有把卡片撑满”，
        // 需要注意：
        // - 在当前写法里，显示框本身其实已经固定好了高度；
        // - 真正的问题通常不是“容器没高度”，而是图片内容被 cover 裁切后，视觉上看起来不够满，
        //   或者主体落点不理想。
        className="relative aspect-[2.8/4] w-full overflow-hidden flex items-center justify-center"
        style={{ background: 'var(--bg-tertiary)' }}
      >
        {item.coverUrl ? (
          <Image
            src={item.coverUrl}
            alt={item.code}
            fill
            unoptimized
            // `sizes` 只影响 Next/Image 选择什么尺寸的资源，不会改变页面上的实际显示大小。
            // 如果你在调“显示效果”，通常不用先动这里。
            // 只有在你确认图片清晰度或加载体积不合适时，才需要回头调整这个值。
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
            // 图片显示策略说明：
            // - `object-cover`：始终铺满容器，宁可裁切，不留空白。
            // - `object-right`：裁切时尽量保留右边内容，适合主体常在右侧的封面。
            // - `origin-right`：hover 放大时以右边为基准缩放，视觉上会更“贴住右侧”。
            //
            // 你可以这样试：
            // 1. 如果觉得主体总被裁掉，先把 `object-right` 改成 `object-center`。
            // 2. 如果觉得 hover 放大后裁得更严重，先把 `scale-105` 改小一点。
            // 3. 如果想让图片看起来“更满”，通常先改外层比例，而不是先改这里。
            //
            // 如果你后面真的想处理“原图偏矮也要视觉上完全撑满”的问题，
            // 一个常见做法是在下面再加一层同图背景填充层：
            // - 底层负责铺满整个卡片
            // - 上层主图负责保持主体清晰
            // 这样会比直接拉伸主图更自然。
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
