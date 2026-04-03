'use client';

import { ArrowUpAZ, ArrowUpDown, Clock3, ListFilter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { SearchBar } from './SearchBar';
import type { AdminPageHeaderProps, SortBy } from './types';
import { ViewToggle } from './ViewToggle';

const SORT_OPTIONS: Array<{
  value: SortBy;
  label: string;
  icon: typeof Clock3;
}> = [
    {
      value: 'updated',
      label: '修改时间',
      icon: Clock3,
    },
    {
      value: 'code',
      label: '首字母',
      icon: ArrowUpAZ,
    },
  ];

export function AdminPageHeader({
  total,
  sortBy,
  viewMode,
  searchInput,
  backgroundInteractionDisabled,
  onSortChange,
  onViewModeChange,
  onSearchInputChange,
  onSearch,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-4 flex flex-col gap-4 animate-fade-in lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold gradient-text">缓存管理</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {total.toLocaleString()} 条
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ViewToggle
          value={viewMode}
          onChange={onViewModeChange}
          disabled={backgroundInteractionDisabled}
        />

        <Select
          disabled={backgroundInteractionDisabled}
          value={sortBy}
          onValueChange={(value) => onSortChange(value as SortBy)}
        >
          <SelectTrigger
            size="lg"
            className={`h-12 min-w-[12.5rem] rounded-2xl border px-4 py-0 shadow-none focus-visible:ring-0 [&_svg.lucide-chevron-down]:mr-0.5 [&_svg.lucide-chevron-down]:size-4 [&_svg.lucide-chevron-down]:text-white/55 ${backgroundInteractionDisabled ? 'opacity-60' : ''}`}
            style={{
              background: 'var(--bg-tertiary)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
            }}
          >
            <SelectValue>
              {(() => {
                const activeOption = SORT_OPTIONS.find((option) => option.value === sortBy);
                const ActiveIcon = activeOption?.icon ?? ArrowUpDown;

                return (
                  <span className="flex w-full items-center gap-3.5">
                    <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <ListFilter className="h-4 w-4" />
                      <span className="font-medium">排序</span>
                    </span>
                    <span
                      className="h-6 w-px shrink-0"
                      style={{ background: 'rgba(255,255,255,0.08)' }}
                    />
                    <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                      <ActiveIcon className="h-4 w-4" />
                      <span className="truncate">{activeOption?.label ?? '选择排序'}</span>
                    </span>
                  </span>
                );
              })()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent
            className="rounded-2xl border p-1.5"
            style={{
              background: 'rgba(24, 24, 26, 0.96)',
              borderColor: 'rgba(255,255,255,0.08)',
              boxShadow: '0 18px 50px rgba(0, 0, 0, 0.32)',
              backdropFilter: 'blur(18px)',
            }}
          >
            {SORT_OPTIONS.map((option) => {
              const OptionIcon = option.icon;

              return (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="min-h-11 rounded-xl px-3 text-[15px]"
                >
                  <OptionIcon className="h-4 w-4" />
                  <span className="font-medium">{option.label}</span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <SearchBar
          value={searchInput}
          onChange={onSearchInputChange}
          onSearch={onSearch}
          disabled={backgroundInteractionDisabled}
        />
      </div>
    </div>
  );
}
