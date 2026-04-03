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
      label: '按修改时间',
      icon: Clock3,
    },
    {
      value: 'code',
      label: '按番号首字母',
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

        <div
          className={`flex h-10 items-center gap-2 rounded-xl border px-3 ${backgroundInteractionDisabled ? 'opacity-60' : ''}`}
          style={{
            background: 'var(--bg-tertiary)',
            borderColor: 'var(--border-subtle)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
          }}
        >
          <ListFilter className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} />

          <Select
            disabled={backgroundInteractionDisabled}
            value={sortBy}
            onValueChange={(value) => onSortChange(value as SortBy)}
          >
            <SelectTrigger
              className="h-10 min-w-44 rounded-lg border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              style={{ color: 'var(--text-primary)' }}
            >
              <SelectValue>
                {(() => {
                  const activeOption = SORT_OPTIONS.find((option) => option.value === sortBy);
                  const ActiveIcon = activeOption?.icon ?? ArrowUpDown;

                  return (
                    <span className="flex items-center gap-2">
                      <ActiveIcon className="h-4 w-4" />
                      <span>{activeOption?.label ?? '选择排序'}</span>
                    </span>
                  );
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => {
                const OptionIcon = option.icon;

                return (
                  <SelectItem key={option.value} value={option.value}>
                    <OptionIcon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

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
