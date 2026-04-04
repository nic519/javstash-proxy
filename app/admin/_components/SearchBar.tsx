'use client';

import { useRef } from 'react';
import { Copy, Search, X } from 'lucide-react';
import type { SearchBarProps } from './types';

/**
 * 搜索栏组件
 * 提供关键词输入和搜索触发功能
 */
export function SearchBar({ value, onChange, onSearch, disabled = false }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasValue = value.trim().length > 0;

  const handlePasteFromClipboard = async () => {
    if (disabled || hasValue || !navigator.clipboard?.readText) {
      return;
    }

    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        return;
      }

      onChange(text);
      inputRef.current?.focus();
    } catch {
      // Ignore clipboard read failures and leave the input unchanged.
    }
  };

  const handleClear = () => {
    if (disabled || !hasValue) {
      return;
    }

    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div
      className={`flex h-12 w-full items-center overflow-hidden rounded-2xl border ${disabled ? 'opacity-60' : ''}`}
      style={{
        background: 'var(--bg-tertiary)',
        borderColor: 'var(--border-subtle)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="relative min-w-0 flex-1">
        {/* 搜索输入框，支持回车触发搜索 */}
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => !disabled && e.key === 'Enter' && onSearch()}
          placeholder="搜索..."
          className="h-12 w-full min-w-0 border-none bg-transparent pl-4 pr-12 text-sm outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
        {hasValue ? (
          <button
            type="button"
            aria-label="清空输入框"
            title="清空输入框"
            disabled={disabled}
            onClick={handleClear}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full transition-colors focus:outline-none"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            aria-label="从剪切板复制"
            title="从剪切板复制"
            disabled={disabled}
            onClick={() => {
              void handlePasteFromClipboard();
            }}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full transition-colors focus:outline-none"
            style={{ color: 'var(--text-muted)' }}
          >
            <Copy className="w-4 h-4" />
          </button>
        )}
      </div>
      <div
        className="flex h-full shrink-0 items-center"
        style={{ borderLeft: '1px solid var(--border-subtle)' }}
      >
        <button
          type="button"
          aria-label="搜索"
          title="搜索"
          disabled={disabled}
          onClick={onSearch}
          className="flex h-full w-12 items-center justify-center self-stretch rounded-none transition-colors focus:outline-none"
          style={{
            background: 'rgba(212, 175, 55, 0.08)',
            color: 'var(--accent-gold)',
            boxShadow: 'inset 1px 0 0 rgba(255, 255, 255, 0.02)',
          }}
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
