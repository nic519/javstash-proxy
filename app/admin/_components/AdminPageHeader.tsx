'use client';

import type { AdminPageHeaderProps } from './types';

export function AdminPageHeader({ total }: AdminPageHeaderProps) {
  return (
    <div className="animate-fade-in">
      <div>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          {total.toLocaleString()} 条
        </p>
      </div>
    </div>
  );
}
