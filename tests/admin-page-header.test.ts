import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdminPageHeader } from '../app/admin/_components/AdminPageHeader';

describe('AdminPageHeader', () => {
  it('renders the extracted admin header with count, sort control, view toggle, and search bar', () => {
    const markup = renderToStaticMarkup(
      createElement(AdminPageHeader, {
        total: 128,
        sortBy: 'updated',
        viewMode: 'table',
        searchInput: 'ABP-123',
        backgroundInteractionDisabled: false,
        onSortChange: () => {},
        onViewModeChange: () => {},
        onSearchInputChange: () => {},
        onSearch: () => {},
      })
    );

    expect(markup).toContain('缓存管理');
    expect(markup).toContain('128 条');
    expect(markup).toContain('排序');
    expect(markup).toContain('修改时间');
    expect(markup).toContain('搜索...');
    expect(markup).toContain('列表');
    expect(markup).toContain('网格');
    expect(markup).toContain('role="combobox"');
    expect(markup).toContain('value="updated"');
    expect(markup).toContain('lucide-clock-3');
    expect(markup).toContain('lucide-list-filter');
  });
});
