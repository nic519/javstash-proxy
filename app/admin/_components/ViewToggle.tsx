'use client';

import { LayoutGrid, Rows3 } from 'lucide-react';
import type { ViewToggleProps } from './types';

/**
 * 管理后台视图切换
 * 在表格视图和网格视图之间切换
 */
export function ViewToggle({ value, onChange, disabled = false }: ViewToggleProps) {
  return (
    <div
      className={`inline-flex h-12 items-center gap-1 rounded-2xl border p-1 ${disabled ? 'opacity-60' : ''}`}
      style={{
        background: 'var(--bg-tertiary)',
        borderColor: 'var(--border-subtle)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
      }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('table')}
        aria-pressed={value === 'table'}
        className="flex h-10 items-center gap-2 rounded-xl px-4 text-sm transition-colors"
        style={{
          background: value === 'table' ? 'rgba(212, 175, 55, 0.16)' : 'transparent',
          color: value === 'table' ? 'var(--accent-gold)' : 'var(--text-muted)',
        }}
      >
        <Rows3 className="h-4 w-4" />
        <span>列表</span>
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('grid')}
        aria-pressed={value === 'grid'}
        className="flex h-10 items-center gap-2 rounded-xl px-4 text-sm transition-colors"
        style={{
          background: value === 'grid' ? 'rgba(212, 175, 55, 0.16)' : 'transparent',
          color: value === 'grid' ? 'var(--accent-gold)' : 'var(--text-muted)',
        }}
      >
        <LayoutGrid className="h-4 w-4" />
        <span>网格</span>
      </button>
    </div>
  );
}
