'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  CalendarDays,
  Clapperboard,
  FileVideo,
  Hash,
  Image as ImageIcon,
  Users,
} from 'lucide-react';
import type { SceneData } from '@/src/graphql/queries';
import type { DetailModalProps, EditForm } from '../types';
import { formatDate, getDetailHeaderMeta, getPerformerNames, getStudioName, getTagColor } from './helpers';

export function DetailView({
  item,
  form,
  onClose,
  onCopyCode,
  copied,
  rawData,
}: {
  item: DetailModalProps['item'];
  form: EditForm;
  onClose: () => void;
  onCopyCode: () => void;
  copied: boolean;
  rawData: SceneData | null;
}) {
  const [imageLoading, setImageLoading] = useState(true);
  const performerNames = getPerformerNames(rawData);
  const releaseDate = rawData ? formatDate(rawData.date) : null;
  const studioName = getStudioName(rawData);
  const headerMeta = getDetailHeaderMeta({
    code: item.code,
    director: typeof rawData?.director === 'string' ? rawData.director : null,
    releaseDate,
    studioName,
  });

  return (
    // 整体主体区域：
    // 1. 默认是上下排布，适合窄屏和普通弹窗宽度。
    // 2. 到 `xl` 之后切成左右两栏，左侧放封面，右侧放文字信息。
    // 3. 如果你觉得“图片和右侧详情之间太挤/太松”，优先调整这里的 `gap-7 xl:gap-10`。
    <div className="flex w-full flex-col gap-7 xl:flex-row xl:gap-10">
      {/* 左侧封面区域：
          - `flex-shrink-0` 防止图片在横向布局下被压扁。
          - `xl:self-start` 让封面在大屏时从顶部对齐，而不是被右侧内容拉伸。 */}
      <div className="flex-shrink-0 xl:self-start">
        <div
          // 封面图外层容器：
          // - `aspect-[3/2]` 控制封面的基础宽高比，想让卡片更高或更宽可以先改这里。
          // - `w-full` 让小屏时封面占满可用宽度。
          // - `xl:w-[600px]` 是大屏时的固定展示宽度，后续如果你要放大/缩小主图，优先调这个值。
          // - `rounded-2xl` 控制圆角大小；如果整体视觉想更硬朗或更柔和，可以改这里。
          className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl cursor-pointer transition-transform hover:scale-[1.02] xl:w-[600px]"
          style={{
            // 最大高度兜底，避免超高屏图片把弹窗纵向撑得太夸张。
            // 如果你希望图片能更高，调大 `80vh`；如果想更克制，调小它。
            maxHeight: '80vh',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.4), 0 0 30px -5px rgba(212,175,55,0.15)',
            background: 'var(--bg-tertiary)',
          }}
          onClick={onClose}
        >
          {form.coverUrl ? (
            <>
              {imageLoading && (
                // 图片加载中的占位层：
                // 图标尺寸目前是 `w-12 h-12`，如果你想让加载状态更明显，可以适当放大。
                <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                  <ImageIcon className="w-12 h-12" style={{ color: 'var(--text-muted)' }} />
                </div>
              )}
              <Image
                src={form.coverUrl}
                alt={item.code}
                width={600}
                height={400}
                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                unoptimized
                onLoad={() => setImageLoading(false)}
              />
              {/* 底部渐变蒙层：
                  主要是给封面底部一点层次感。
                  如果你之后想在图上叠标题/按钮，这一层也可以顺手一起加深。 */}
              <div
                className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)' }}
              />
            </>
          ) : (
            // 没有封面时的兜底占位。
            // 同样使用 `w-12 h-12`，后续如果要统一和加载态的视觉大小，也改这里。
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="w-12 h-12" style={{ color: 'var(--text-muted)' }} />
            </div>
          )}
        </div>
      </div>

      {/* 右侧详情内容区域：
          - `flex-1` 负责吃掉剩余空间。
          - `min-w-0` 很重要，可以避免长文本把 flex 布局撑爆。 */}
      <div className="flex-1 min-w-0 self-start">
        {/* 右侧信息块纵向间距：
            如果你想让标题、摘要、演员、标签这些模块更紧凑或更舒展，优先调整 `gap-4`。 */}
        <div className="flex flex-col gap-4">
          {/* 顶部元信息行：
              这里展示番号 / 导演 / 日期 / 片商。
              `gap-x-6 gap-y-2` 控制换行前后的横纵间距，是调这一区块密度最直接的位置。 */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 xl:flex-nowrap xl:justify-between">
            {headerMeta.map((meta) => {
              const icon = meta.key === 'code'
                ? (
                  <Hash
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: 'var(--text-muted)' }}
                    aria-hidden="true"
                  />
                )
                : meta.key === 'director'
                  ? (
                    <Clapperboard
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: 'var(--text-muted)' }}
                      aria-hidden="true"
                    />
                  )
                  : meta.key === 'date'
                    ? (
                      <CalendarDays
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: 'var(--text-muted)' }}
                        aria-hidden="true"
                      />
                    )
                    : (
                      <FileVideo
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: 'var(--text-muted)' }}
                        aria-hidden="true"
                      />
                    );

              const content = (
                <>
                  {icon}
                  {meta.key !== 'code' && (
                    // 普通字段的小标题，例如“导演 / 日期 / 片商”。
                    // 如果想让辅助标签更醒目，可以适当增大 `text-xs` 或降低字间距。
                    <span
                      className="text-xs tracking-[0.12em]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {meta.label}
                    </span>
                  )}
                  {/* 字段正文：
                      - `text-sm sm:text-[15px]` 控制不同屏幕下的显示字号。
                      - 番号额外使用 `font-mono`，方便快速识别与复制。
                      - 如果你觉得顶部信息不够显眼，优先放大这里的字号。 */}
                  <span
                    className={`min-w-0 text-sm sm:text-[15px] ${meta.key === 'code' ? 'font-mono' : ''}`}
                    style={{ color: meta.key === 'code' && copied ? '#86efac' : meta.key === 'code' ? 'var(--accent-gold)' : 'var(--text-primary)' }}
                  >
                    {meta.value}
                  </span>
                </>
              );

              if (meta.key === 'code') {
                return (
                  <button
                    key={meta.key}
                    onClick={onCopyCode}
                    // 番号做成按钮是为了支持一键复制。
                    // `xl:flex-1` 会让大屏时它和其他字段更平均地分配空间；
                    // 如果你想让番号区域更短、更紧凑，可以先去掉或调整这个类。
                    className="inline-flex min-w-0 items-center gap-2 rounded-lg transition-opacity hover:opacity-80 xl:flex-1"
                    style={{ color: 'var(--text-primary)' }}
                    title="点击复制番号"
                  >
                    {content}
                  </button>
                );
              }

              return (
                <div
                  key={meta.key}
                  // 普通元信息项和番号保持一致的横向排版节奏，方便视觉对齐。
                  className="inline-flex min-w-0 items-center gap-2 xl:flex-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {content}
                </div>
              );
            })}
          </div>

          {/* 分隔线：
              如果觉得上下区块分隔不明显，可以把金色透明度调高一点。 */}
          <div
            className="h-px"
            style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.18), rgba(255,255,255,0.02))' }}
          />

          {/* 摘要正文：
              - `text-[15px]` 控制摘要字号。
              - `leading-7` 控制行高；如果你主要想调“段落看起来更松/更紧”，这里是首选。
              - `whitespace-pre-wrap` 让换行能按原文本保留下来。 */}
          <p
            className="whitespace-pre-wrap text-[15px] leading-7"
            style={{ color: 'var(--text-secondary)' }}
          >
            {form.summaryZh || '-'}
          </p>

          {rawData ? (
            <>
              {performerNames.length > 0 && (
                // 演员信息块：
                // 外层在小屏下纵向排列，大一点的屏幕改成横向，方便标题和内容自然对齐。
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                  {/* 左边“演员”标签区。
                      `gap-2.5` 和 `pt-0.5` 主要用于微调图标与文字的视觉对齐。 */}
                  <div className="flex items-center gap-2.5 pt-0.5">
                    <Users
                      className="w-4 h-4 flex-shrink-0"
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
                  {/* 右边演员名字区：
                      - `gap-x-3 gap-y-1` 控制名字之间的横向和换行间距。
                      - `text-[15px] leading-6` 控制演员文本的整体观感大小。 */}
                  <div
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] leading-6"
                    style={{ color: 'var(--accent-gold)' }}
                  >
                    {performerNames.map((name, index) => (
                      <div key={name} className="flex items-center gap-3">
                        {index > 0 && (
                          // 每个演员之间的细分隔线。
                          // 如果你想让分隔更明显，可以提高背景透明度或增加高度。
                          <span
                            className="h-3 w-px rounded-full"
                            style={{ background: 'rgba(212,175,55,0.22)' }}
                            aria-hidden="true"
                          />
                        )}
                        <span className="whitespace-nowrap">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(rawData.tags) && rawData.tags.length > 0 && (
                // 标签区域：
                // `gap-2.5` 控制标签与标签之间的呼吸感。
                // 这里只显示前 8 个标签，如果以后想放更多，可以调整 `slice(0, 8)`。
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {rawData.tags.slice(0, 8).map((tag, idx) => {
                    if (!tag.name) return null;

                    const tagColor = getTagColor(tag.name);

                    return (
                      <span
                        key={`${tag.name}-${idx}`}
                        // 单个标签胶囊：
                        // `px-3 py-1 text-xs` 是调标签体积最直接的位置。
                        // 想让标签更饱满就加 padding，想更精致紧凑就减小 padding。
                        className="inline-block rounded-full border px-3 py-1 text-xs"
                        style={{
                          background: tagColor.background,
                          color: tagColor.color,
                          borderColor: tagColor.border,
                        }}
                      >
                        {tag.name}
                      </span>
                    );
                  })}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
