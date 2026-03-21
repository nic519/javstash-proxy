'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationProps } from './types';

/**
 * 分页组件
 * 显示当前页码和翻页按钮
 */
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  // 只有一页时不显示分页
  if (totalPages <= 1) return null;

  return (
    <div
      className="flex items-center justify-between px-3 py-2"
      style={{ borderTop: '1px solid var(--border-subtle)' }}
    >
      {/* 页码指示器 */}
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {page} / {totalPages}
      </span>
      {/* 翻页按钮组 */}
      <div className="flex gap-1">
        {/* 上一页按钮：首页时禁用 */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1 rounded transition-colors disabled:opacity-50"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {/* 下一页按钮：末页时禁用 */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-1 rounded transition-colors disabled:opacity-50"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
