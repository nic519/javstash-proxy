'use client';

import { useState, type MouseEvent } from 'react';
import { Hash, Users } from 'lucide-react';
import { toast } from 'sonner';

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
  variant = 'detail',
  maxVisibleNames,
}: {
  names: string[];
  variant?: 'detail' | 'row' | 'compact';
  maxVisibleNames?: number;
}) {
  if (names.length === 0) return null;

  const visibleNames = typeof maxVisibleNames === 'number' ? names.slice(0, maxVisibleNames) : names;
  const hasOverflow = visibleNames.length < names.length;

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
          {visibleNames.map((name, index) => (
            <div key={name} className="flex items-center gap-2">
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
      <div
        className={variant === 'row'
          ? 'flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-6'
          : 'flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] leading-6'}
        style={{ color: 'var(--accent-gold)' }}
      >
        {visibleNames.map((name, index) => (
          <div key={name} className="flex items-center gap-3">
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
