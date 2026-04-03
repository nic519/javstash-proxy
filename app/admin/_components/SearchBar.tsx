'use client';

import { Search } from 'lucide-react';
import type { SearchBarProps } from './types';

/**
 * 搜索栏组件
 * 提供关键词输入和搜索触发功能
 */
export function SearchBar({ value, onChange, onSearch, disabled = false }: SearchBarProps) {
  return (
    <div className="flex gap-2">
      {/* 搜索输入框，支持回车触发搜索 */}
      <input
        type="text"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => !disabled && e.key === 'Enter' && onSearch()}
        placeholder="搜索..."
        className="w-48 px-3 py-1.5 text-sm rounded-lg border-none outline-none"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
      />
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
