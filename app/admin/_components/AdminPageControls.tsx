'use client';

import { ArrowUpAZ, ArrowUpDown, Clock3, Dices, ListFilter, Shuffle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { SearchBar } from './SearchBar';
import type { AdminPageControlsProps, SortBy } from './types';
import { ViewToggle } from './ViewToggle';

const SORT_OPTIONS: Array<{
  value: SortBy;
  label: string;
  icon: typeof Clock3;
}> = [
    { value: 'updated', label: '修改时间', icon: Clock3 },
    { value: 'code', label: '首字母', icon: ArrowUpAZ },
  ];

export function AdminPageControls({
  sortBy,
  randomMode,
  viewMode,
  searchInput,
  backgroundInteractionDisabled,
  onSortChange,
  onRandomModeChange,
  onRandomRefresh,
  onViewModeChange,
  onSearchInputChange,
  onSearch,
}: AdminPageControlsProps) {
  return (
    <aside
      className="animate-fade-in"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.01))',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '28px',
        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.14)',
      }}
    >
      <div className="space-y-4 p-5">
          <div
            className={`rounded-3xl border transition-colors ${randomMode ? 'p-4' : 'p-3.5'} ${backgroundInteractionDisabled ? 'opacity-60' : ''}`}
            style={{
              background: randomMode ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.03)',
              borderColor: randomMode ? 'rgba(212, 175, 55, 0.22)' : 'rgba(255,255,255,0.05)',
            }}
          >
            <div className={`flex items-center justify-between gap-3 ${randomMode ? 'mb-4' : ''}`}>
              <div className="flex items-center gap-2">
                <Shuffle
                  className="h-4 w-4"
                  style={{ color: randomMode ? 'var(--accent-gold)' : 'var(--text-muted)' }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: randomMode ? 'var(--accent-gold)' : 'var(--text-primary)' }}
                >
                  随机模式
                </span>
              </div>

              <button
                type="button"
                disabled={backgroundInteractionDisabled}
                role="switch"
                aria-checked={randomMode}
                onClick={() => onRandomModeChange(!randomMode)}
                className="group inline-flex items-center"
                title={randomMode ? '关闭随机模式' : '开启随机模式'}
              >
                <span
                  className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors"
                  style={{
                    background: randomMode ? 'var(--accent-gold)' : 'rgba(255,255,255,0.14)',
                    boxShadow: randomMode
                      ? 'inset 0 0 0 1px rgba(15,15,20,0.08)'
                      : 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                  }}
                >
                  <span
                    className="absolute h-5 w-5 rounded-full bg-white transition-transform"
                    style={{
                      left: '4px',
                      transform: randomMode ? 'translateX(16px)' : 'translateX(0)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.22)',
                    }}
                  />
                </span>
              </button>
            </div>

            {randomMode ? (
              <button
                type="button"
                disabled={backgroundInteractionDisabled}
                onClick={onRandomRefresh}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl text-sm font-medium transition-colors"
                title="换一组随机结果"
                style={{
                  background: 'rgba(212, 175, 55, 0.16)',
                  color: 'var(--accent-gold)',
                }}
              >
                <Dices className="h-4 w-4" />
                <span>换一组</span>
              </button>
            ) : null}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>
              视图
            </p>
            <ViewToggle
              value={viewMode}
              onChange={onViewModeChange}
              disabled={backgroundInteractionDisabled}
            />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>
              排序
            </p>
            <Select
              disabled={backgroundInteractionDisabled || randomMode}
              value={sortBy}
              onValueChange={(value) => onSortChange(value as SortBy)}
            >
              <SelectTrigger
                size="lg"
                className={`h-12 w-full rounded-2xl border px-4 py-0 shadow-none focus-visible:ring-0 [&_svg.lucide-chevron-down]:mr-0.5 [&_svg.lucide-chevron-down]:size-4 [&_svg.lucide-chevron-down]:text-white/55 ${backgroundInteractionDisabled ? 'opacity-60' : ''}`}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.06)',
                  color: 'var(--text-primary)',
                }}
              >
                <SelectValue>
                  {(() => {
                    const activeOption = SORT_OPTIONS.find((option) => option.value === sortBy);
                    const ActiveIcon = activeOption?.icon ?? ArrowUpDown;

                    return (
                      <span className="flex w-full items-center gap-3">
                        <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                          <ListFilter className="h-4 w-4" />
                          <span className="font-medium">排序</span>
                        </span>
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
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>
              搜索
            </p>
            <SearchBar
              value={searchInput}
              onChange={onSearchInputChange}
              onSearch={onSearch}
              disabled={backgroundInteractionDisabled}
            />
          </div>
        </div>
    </aside>
  );
}
