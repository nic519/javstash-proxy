'use client';

import { useState } from 'react';
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PaginationProps } from './types';
import { PAGE_SIZE_OPTIONS } from './types';

/**
 * 分页组件
 * 显示页码、快速跳转和每页数量选择
 */
export function Pagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
  pageSize,
  onPageSizeChange,
  disabled = false,
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
      pages.push(1);
      if (page > 3) pages.push('ellipsis');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('ellipsis');
      if (totalPages > 1) pages.push(totalPages);
    }
    return pages;
  };

  const handleJump = () => {
    const p = parseInt(jumpPage, 10);
    if (p >= 1 && p <= totalPages) {
      onPageChange(p);
      setJumpPage('');
    }
  };

  return (
    <div
      className="sticky bottom-0 z-20 mx-3 mb-3 mt-2 flex shrink-0 items-center justify-between rounded-2xl px-3 py-2 backdrop-blur-sm"
      style={{
        background: 'linear-gradient(180deg, rgba(15, 15, 18, 0.84), rgba(15, 15, 18, 0.72))',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.18)',
      }}
    >
      {/* 左侧: 每页数量 */}
      {pageSize && onPageSizeChange && (
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
            disabled={disabled}
          >
            <SelectTrigger className="h-8 w-20 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} 条
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-col leading-tight">
            {typeof totalItems === 'number' ? (
              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                总计 {totalItems.toLocaleString()} 条
              </span>
            ) : null}
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              共 {totalPages} 页
            </span>
          </div>
        </div>
      )}

      {/* 中间: 页码 */}
      <ShadcnPagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => !disabled && onPageChange(page - 1)}
              className={page === 1 || disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          {getPageNumbers().map((p, i) =>
            p === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={page === p}
                  onClick={() => !disabled && onPageChange(p)}
                  className={disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              onClick={() => !disabled && onPageChange(page + 1)}
              className={page === totalPages || disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </ShadcnPagination>

      {/* 右侧: 快速跳转 */}
      <div className="flex items-center gap-1">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          跳转
        </span>
        <input
          type="number"
          disabled={disabled}
          value={jumpPage}
          onChange={(e) => setJumpPage(e.target.value)}
          onKeyDown={(e) => !disabled && e.key === 'Enter' && handleJump()}
          placeholder={String(page)}
          className="w-14 h-7 px-2 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={handleJump}
          className="h-7 px-2 rounded text-xs transition-colors hover:bg-amber-500/20"
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
          }}
        >
          GO
        </button>
      </div>
    </div>
  );
}
