'use client';

import type { TranslationTableProps } from './types';

/**
 * 翻译缓存表格组件
 * 展示翻译列表，支持点击行查看详情
 */
export function TranslationTable({ items, loading, onSelect }: TranslationTableProps) {
  // 加载中状态：显示旋转加载动画
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'var(--border-light)', borderTopColor: 'var(--accent-gold)' }}
        />
      </div>
    );
  }

  // 空数据状态：显示提示文字
  if (items.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
        暂无数据
      </div>
    );
  }

  // 正常状态：渲染数据表格
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <th className="text-left px-3 py-2 font-medium" style={{ color: 'var(--text-muted)' }}>
              代码
            </th>
            <th className="text-left px-3 py-2 font-medium" style={{ color: 'var(--text-muted)' }}>
              中文标题
            </th>
            {/* 大屏幕下才显示简介列 */}
            <th className="text-left px-3 py-2 font-medium hidden lg:table-cell" style={{ color: 'var(--text-muted)' }}>
              中文简介
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.code}
              onClick={() => onSelect(item)}
              className="cursor-pointer transition-colors hover:bg-[var(--bg-tertiary)]"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              {/* 代码列：不换行显示 */}
              <td className="px-3 py-2">
                <span className="font-mono whitespace-nowrap" style={{ color: 'var(--accent-gold)' }}>
                  {item.code}
                </span>
              </td>
              {/* 标题列：超长文本截断 */}
              <td className="px-3 py-2 max-w-xs">
                <p className="truncate" style={{ color: 'var(--text-primary)' }}>
                  {item.titleZh || '-'}
                </p>
              </td>
              {/* 简介列：大屏幕可见，超长文本截断 */}
              <td className="px-3 py-2 hidden lg:table-cell">
                <p className="truncate max-w-md" style={{ color: 'var(--text-secondary)' }}>
                  {item.summaryZh || '-'}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
