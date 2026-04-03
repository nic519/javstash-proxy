'use client';

import { useState } from 'react';
import {
  Pagination as ShadcnPagination,
  PaginationContent,
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
  variant = 'full',
  disabled = false,
}: PaginationProps) {
  const [jumpPage, setJumpPage] = useState('');

  // 只有一页时不显示分页
  if (totalPages <= 1) return null;

  const getVisiblePageNumbers = () => {
    const pages: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    for (let current = start; current <= end; current += 1) {
      pages.push(current);
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

  const renderPageLinks = () => (
    <ShadcnPagination className="mx-0 w-auto">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => !disabled && onPageChange(page - 1)}
            className={page === 1 || disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
        {getVisiblePageNumbers().map((visiblePage) => (
          <PaginationItem key={visiblePage}>
            <PaginationLink
              isActive={page === visiblePage}
              onClick={() => !disabled && onPageChange(visiblePage)}
              className={disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            >
              {visiblePage}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={() => !disabled && onPageChange(page + 1)}
            className={page === totalPages || disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
      </PaginationContent>
    </ShadcnPagination>
  );

  const renderCompactPagination = (className?: string) => (
    <div
      data-compact-pagination="true"
      className={`flex min-w-0 flex-1 items-center justify-between gap-2 ${className ?? ''}`}
    >
      <div className="shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>
        共 {totalPages} 页
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center gap-1 px-2">
        {getVisiblePageNumbers().map((compactPage) => {
          const active = compactPage === page;

          return (
            <button
              key={compactPage}
              type="button"
              disabled={disabled || active}
              onClick={() => !disabled && onPageChange(compactPage)}
              aria-current={active ? 'page' : undefined}
            className="inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors disabled:cursor-default"
            style={{
              background: active ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${active ? 'rgba(212, 175, 55, 0.26)' : 'rgba(255,255,255,0.04)'}`,
              color: active ? 'var(--accent-gold)' : 'var(--text-muted)',
              boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.06)' : undefined,
            }}
          >
            {compactPage}
          </button>
          );
        })}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <input
          type="number"
          disabled={disabled}
          value={jumpPage}
          onChange={(e) => setJumpPage(e.target.value)}
          onKeyDown={(e) => !disabled && e.key === 'Enter' && handleJump()}
          placeholder={String(page)}
          className="h-7 w-10 rounded-md px-1.5 text-center text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/50"
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
          className="h-7 rounded-md px-2 text-[11px] transition-colors hover:bg-amber-500/20"
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

  const renderFullPagination = (className?: string) => (
    <div className={`flex items-center justify-between gap-3 ${className ?? ''}`}>
      {pageSize && onPageSizeChange ? (
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
      ) : (
        <div />
      )}

      {renderPageLinks()}

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

  return (
    <div
      className="sticky bottom-0 z-20 mx-3 mb-3 mt-2 flex shrink-0 rounded-2xl px-3 py-2 backdrop-blur-sm"
      style={{
        background: 'linear-gradient(180deg, rgba(15, 15, 18, 0.84), rgba(15, 15, 18, 0.72))',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.18)',
      }}
    >
      {variant === 'compact' ? renderCompactPagination() : null}
      {variant === 'full' ? renderFullPagination() : null}
      {variant === 'responsive' ? (
        <>
          {renderCompactPagination('md:hidden')}
          {renderFullPagination('hidden md:flex')}
        </>
      ) : null}
    </div>
  );
}
