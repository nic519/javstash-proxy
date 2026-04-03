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
    <div className="flex gap-2">
      {/* 搜索输入框，支持回车触发搜索 */}
      <input
        ref={inputRef}
        type="text"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => !disabled && e.key === 'Enter' && onSearch()}
        placeholder="搜索..."
        className="w-48 px-3 py-1.5 text-sm rounded-lg border-none outline-none"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
      />
      <button
        type="button"
        aria-label="从剪切板复制"
        title="从剪切板复制"
        disabled={disabled}
        onClick={() => {
          void handlePasteFromClipboard();
        }}
        className="p-1.5 rounded-lg transition-colors"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
      >
        <ClipboardPaste className="w-4 h-4" />
      </button>
      <button
        type="button"
        aria-label="清空输入框"
        title="清空输入框"
        disabled={disabled || !hasValue}
        onClick={handleClear}
        className="p-1.5 rounded-lg transition-colors"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
      >
        <X className="w-4 h-4" />
      </button>
      {/* 搜索按钮 */}
      <button
        type="button"
        disabled={disabled}
        onClick={onSearch}
        className="p-1.5 rounded-lg transition-colors"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
      >
        <Search className="w-4 h-4" />
      </button>
    </div>
  );
}
