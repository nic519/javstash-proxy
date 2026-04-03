'use client';

import { useRef } from 'react';
import { ClipboardPaste, Search, X } from 'lucide-react';
import type { SearchBarProps } from './types';

/**
 * 搜索栏组件
 * 提供关键词输入和搜索触发功能
 */
export function SearchBar({ value, onChange, onSearch, disabled = false }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasValue = value.trim().length > 0;
  const actionButtonClassName =
    'my-1 flex h-9 w-9 items-center justify-center rounded-md transition-colors focus:outline-none';
  const actionButtonStyle = {
    color: 'var(--text-primary)',
  } as const;

  const handlePasteFromClipboard = async () => {
    if (disabled || typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
      return;
    }

    const clipboardText = await navigator.clipboard.readText();
    onChange(clipboardText);
    inputRef.current?.focus();
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
      className={`flex items-center overflow-hidden rounded-xl border ${disabled ? 'opacity-60' : ''}`}
      style={{
        background: 'var(--bg-tertiary)',
        borderColor: 'var(--border-subtle)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* 搜索输入框，支持回车触发搜索 */}
      <input
        ref={inputRef}
        type="text"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => !disabled && e.key === 'Enter' && onSearch()}
        placeholder="搜索..."
        className="h-9 w-56 min-w-0 border-none bg-transparent px-3 text-sm outline-none"
        style={{ color: 'var(--text-primary)' }}
      />
      <div
        className="flex self-stretch items-center pl-1"
        style={{ borderLeft: '1px solid var(--border-subtle)' }}
      >
        <button
          type="button"
          aria-label="从剪切板复制"
          title="从剪切板复制"
          disabled={disabled}
          onClick={() => {
            void handlePasteFromClipboard();
          }}
          className={actionButtonClassName}
          style={actionButtonStyle}
        >
          <ClipboardPaste className="w-4 h-4" />
        </button>
        {hasValue ? (
          <button
            type="button"
            aria-label="清空输入框"
            title="清空输入框"
            disabled={disabled}
            onClick={handleClear}
            className={actionButtonClassName}
            style={actionButtonStyle}
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
        <button
          type="button"
          aria-label="搜索"
          title="搜索"
          disabled={disabled}
          onClick={onSearch}
          className="flex min-w-12 items-center justify-center self-stretch rounded-none px-3 transition-colors focus:outline-none"
          style={{
            borderLeft: '1px solid rgba(212, 175, 55, 0.1)',
            background:
              'linear-gradient(180deg, rgba(212, 175, 55, 0.18) 0%, rgba(212, 175, 55, 0.1) 100%)',
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
