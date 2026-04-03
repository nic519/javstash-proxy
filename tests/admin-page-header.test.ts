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
        randomMode: false,
        viewMode: 'table',
        searchInput: 'ABP-123',
        backgroundInteractionDisabled: false,
        onSortChange: () => {},
        onRandomModeChange: () => {},
        onRandomRefresh: () => {},
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
    expect(markup).toContain('随机模式');
    expect(markup).toContain('role="switch"');
    expect(markup).toContain('aria-checked="false"');
    expect(markup).not.toContain('换一组');
  });

  it('renders the sort trigger with the large select size so it can match the other controls', () => {
    const markup = renderToStaticMarkup(
      createElement(AdminPageHeader, {
        total: 128,
        sortBy: 'updated',
        randomMode: false,
        viewMode: 'table',
        searchInput: '',
        backgroundInteractionDisabled: false,
        onSortChange: () => {},
        onRandomModeChange: () => {},
        onRandomRefresh: () => {},
        onViewModeChange: () => {},
        onSearchInputChange: () => {},
        onSearch: () => {},
      })
    );

    expect(markup).toContain('data-size="lg"');
  });

  it('shows the merged random refresh action and disables sort control in random mode', () => {
    const markup = renderToStaticMarkup(
      createElement(AdminPageHeader, {
        total: 128,
        sortBy: 'updated',
        randomMode: true,
        viewMode: 'table',
        searchInput: '',
        backgroundInteractionDisabled: false,
        onSortChange: () => {},
        onRandomModeChange: () => {},
        onRandomRefresh: () => {},
        onViewModeChange: () => {},
        onSearchInputChange: () => {},
        onSearch: () => {},
      })
    );

    expect(markup).toContain('换一组');
    expect(markup).toContain('role="switch"');
    expect(markup).toContain('aria-checked="true"');
    expect(markup).toContain('disabled=""');
  });
});
