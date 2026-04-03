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
      className="inline-flex items-center gap-1 rounded-xl p-1"
      style={{ background: 'var(--bg-tertiary)' }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('table')}
        aria-pressed={value === 'table'}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
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
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
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
