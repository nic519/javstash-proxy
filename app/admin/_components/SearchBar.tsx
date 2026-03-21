'use client';

import type { SearchBarProps } from './types';

/**
 * 搜索栏组件
 * 提供关键词输入和搜索触发功能
 */
export function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  return (
    <div className="flex gap-2">
      {/* 搜索输入框，支持回车触发搜索 */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        placeholder="搜索..."
        className="w-48 px-3 py-1.5 text-sm rounded-lg border-none outline-none"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
      />
      {/* 搜索按钮 */}
      <button
        onClick={onSearch}
        className="p-1.5 rounded-lg transition-colors"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </div>
  );
}
