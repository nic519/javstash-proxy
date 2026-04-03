'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  CalendarDays,
  Check,
  Clapperboard,
  Copy,
  FileVideo,
  Hash,
  Image as ImageIcon,
  Loader2,
  Users,
} from 'lucide-react';
import type { SceneData } from '@/src/graphql/queries';
import type { DetailModalProps, EditForm } from '../types';
import { formatDate, getPerformerNames, getStudioName, getTagColor } from './helpers';

export function DetailView({
  item,
  form,
  onClose,
  onCopyCode,
  copied,
  rawData,
  rawDataLoading,
}: {
  item: DetailModalProps['item'];
  form: EditForm;
  onClose: () => void;
  onCopyCode: () => void;
  copied: boolean;
  rawData: SceneData | null;
  rawDataLoading: boolean;
}) {
  const [imageLoading, setImageLoading] = useState(true);
  const performerNames = getPerformerNames(rawData);
  const releaseDate = rawData ? formatDate(rawData.date) : null;
  const studioName = getStudioName(rawData);

  return (
    <div className="flex w-full gap-10">
      <div className="flex-shrink-0">
        <div
          className="relative rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
          style={{
            width: 540,
            height: 360,
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

      <div className="flex-1 space-y-4 min-w-0 self-start">
        <div className="space-y-3">
          <div className="grid grid-cols-3">
            <button
              onClick={onCopyCode}
              className="flex w-full items-center justify-start gap-1 group cursor-pointer rounded-xl"
              title="点击复制"
            >
              <Hash
                className="w-4 h-4 flex-shrink-0"
                style={{ color: 'var(--text-muted)' }}
                aria-hidden="true"
              />
              <span
                className="font-mono text-sm whitespace-nowrap"
                style={{ color: 'var(--accent-gold)' }}
              >
                {item.code}
              </span>
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--text-muted)' }}
                />
              )}
            </button>

            <div className="flex min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-2" style={{ color: 'var(--text-primary)' }}>
              <CalendarDays
                className="w-4 h-4 flex-shrink-0"
                style={{ color: 'var(--text-muted)' }}
                aria-hidden="true"
              />
              <span className="text-sm whitespace-nowrap">{releaseDate || '-'}</span>
            </div>

            <div className="flex min-w-0 items-center justify-end gap-2 rounded-xl px-3 py-2" style={{ color: 'var(--text-primary)' }}>
              <FileVideo
                className="w-4 h-4 flex-shrink-0"
                style={{ color: 'var(--text-muted)' }}
                aria-hidden="true"
              />
              <span className="text-sm whitespace-nowrap">{studioName || '-'}</span>
            </div>
          </div>
        </div>

        <p className="whitespace-pre-wrap leading-relaxed">{form.summaryZh || '-'}</p>

        {rawDataLoading ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-muted)' }}>正在加载原始数据...</span>
          </div>
        ) : rawData ? (
          <>
            <div className="grid grid-cols-3 gap-4">
              {typeof rawData.director === 'string' && rawData.director && (
                <div className="flex items-center gap-2.5 text-sm whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                  <Clapperboard
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: 'var(--text-muted)' }}
                    aria-hidden="true"
                  />
                  <span
                    className="whitespace-nowrap text-sm tracking-[0.08em]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    导演
                  </span>
                  <span className="whitespace-nowrap text-[15px] leading-6">{rawData.director}</span>
                </div>
              )}
            </div>

            {performerNames.length > 0 && (
              <div className="flex items-center gap-2.5">
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
              <div className="flex items-start">
                <div className="flex flex-wrap gap-3">
                  {rawData.tags.slice(0, 8).map((tag, idx) => {
                    if (!tag.name) return null;

                    const tagColor = getTagColor(tag.name);

                    return (
                      <span
                        key={`${tag.name}-${idx}`}
                        className="inline-block rounded-md border px-2.5 py-1 text-xs"
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
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
