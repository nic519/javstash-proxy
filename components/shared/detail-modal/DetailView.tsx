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
    <div className="flex w-full flex-col gap-7 xl:flex-row xl:gap-10">
      <div className="flex-shrink-0 xl:self-start">
        <div
          className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl cursor-pointer transition-transform hover:scale-[1.02] xl:w-[540px]"
          style={{
            maxHeight: '70vh',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.4), 0 0 30px -5px rgba(212,175,55,0.15)',
            background: 'var(--bg-tertiary)',
          }}
          onClick={onClose}
        >
          {form.coverUrl ? (
            <>
              {imageLoading && (
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
              <div
                className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)' }}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="w-12 h-12" style={{ color: 'var(--text-muted)' }} />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 self-start">
        <div className="flex flex-col gap-4">
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
                    <span
                      className="text-xs tracking-[0.12em]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {meta.label}
                    </span>
                  )}
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
                  className="inline-flex min-w-0 items-center gap-2 xl:flex-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {content}
                </div>
              );
            })}
          </div>

          <div
            className="h-px"
            style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.18), rgba(255,255,255,0.02))' }}
          />

          <p
            className="whitespace-pre-wrap text-[15px] leading-7"
            style={{ color: 'var(--text-secondary)' }}
          >
            {form.summaryZh || '-'}
          </p>

          {rawData ? (
            <>
              {performerNames.length > 0 && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
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
                  <div
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] leading-6"
                    style={{ color: 'var(--accent-gold)' }}
                  >
                    {performerNames.map((name, index) => (
                      <div key={name} className="flex items-center gap-3">
                        {index > 0 && (
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
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {rawData.tags.slice(0, 8).map((tag, idx) => {
                    if (!tag.name) return null;

                    const tagColor = getTagColor(tag.name);

                    return (
                      <span
                        key={`${tag.name}-${idx}`}
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
