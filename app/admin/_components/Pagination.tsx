'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { PaginationProps } from './types';
import { PAGE_SIZE_OPTIONS } from './types';

/**
 * 分页组件
 * 显示页码、快速跳转和每页数量选择
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: PaginationProps) {
  const [jumpPage, setJumpPage] = useState('');

  // 只有一页时不显示分页
  if (totalPages <= 1) return null;

  // 计算显示的页码范围
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // 始终显示第一页
      pages.push(1);

      if (page > 3) pages.push('ellipsis');

      // 当前页附近的页码
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (page < totalPages - 2) pages.push('ellipsis');

      // 始终显示最后一页
      if (totalPages > 1) pages.push(totalPages);
    }

    return pages;
  };

  const handleJump = () => {
    const pageNum = parseInt(jumpPage, 10);
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setJumpPage('');
    }
  };

  return (
    <div
      className="flex items-center justify-between px-3 py-2 flex-wrap gap-3"
      style={{ borderTop: '1px solid var(--border-subtle)' }}
    >
      {/* 左侧：每页数量选择 */}
      {pageSize && onPageSizeChange && (
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            每页
          </span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 rounded text-xs"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            条
          </span>
        </div>
      )}

      {/* 中间：页码 */}
      <div className="flex items-center gap-1">
        {/* 首页 */}
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="p-1 rounded transition-colors disabled:opacity-50"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
          title="首页"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        {/* 上一页 */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1 rounded transition-colors disabled:opacity-50"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
          title="上一页"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* 页码按钮 */}
        {getPageNumbers().map((p, i) =>
          p === 'ellipsis' ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className="w-7 h-7 rounded text-xs transition-colors"
              style={{
                background: p === page ? 'var(--accent-gold)' : 'var(--bg-tertiary)',
                color: p === page ? '#000' : 'var(--text-primary)',
                fontWeight: p === page ? 600 : 400,
              }}
            >
              {p}
            </button>
          )
        )}

        {/* 下一页 */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-1 rounded transition-colors disabled:opacity-50"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
          title="下一页"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        {/* 末页 */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="p-1 rounded transition-colors disabled:opacity-50"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
          title="末页"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>

      {/* 右侧：快速跳转 */}
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          跳转
        </span>
        <input
          type="number"
          value={jumpPage}
          onChange={(e) => setJumpPage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleJump()}
          placeholder={String(page)}
          className="w-14 px-2 py-1 rounded text-xs text-center"
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
          }}
        />
        <button
          onClick={handleJump}
          className="px-2 py-1 rounded text-xs transition-colors"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
        >
          GO
        </button>
      </div>
    </div>
  );
}
