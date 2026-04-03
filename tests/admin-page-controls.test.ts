import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdminPageControls } from '../app/admin/_components/AdminPageControls';

describe('AdminPageControls', () => {
  it('keeps the random mode card compact while the mode is turned off', () => {
    const markup = renderToStaticMarkup(
      createElement(AdminPageControls, {
        sortBy: 'updated',
        randomMode: false,
        viewMode: 'table',
        searchInput: '',
        onSortChange: () => {},
        onRandomModeChange: () => {},
        onRandomRefresh: () => {},
        onViewModeChange: () => {},
        onSearchInputChange: () => {},
        onSearch: () => {},
      })
    );

    expect(markup).toContain('rounded-3xl border transition-colors p-3.5');
    expect(markup).not.toContain('title="换一组随机结果"');
  });

  it('renders a plain control card without a separate mobile toggle shell', () => {
    const markup = renderToStaticMarkup(
      createElement(AdminPageControls, {
        sortBy: 'updated',
        randomMode: false,
        viewMode: 'table',
        searchInput: '',
        onSortChange: () => {},
        onRandomModeChange: () => {},
        onRandomRefresh: () => {},
        onViewModeChange: () => {},
        onSearchInputChange: () => {},
        onSearch: () => {},
      })
    );

    expect(markup).toContain('class="animate-fade-in"');
    expect(markup).not.toContain('aria-controls="admin-page-controls-panel"');
    expect(markup).not.toContain('筛选');
  });

  it('expands the random mode card only when the mode is enabled', () => {
    const markup = renderToStaticMarkup(
      createElement(AdminPageControls, {
        sortBy: 'updated',
        randomMode: true,
        viewMode: 'table',
        searchInput: '',
        onSortChange: () => {},
        onRandomModeChange: () => {},
        onRandomRefresh: () => {},
        onViewModeChange: () => {},
        onSearchInputChange: () => {},
        onSearch: () => {},
      })
    );

    expect(markup).toContain('rounded-3xl border transition-colors p-4');
    expect(markup).toContain('title="换一组随机结果"');
  });
});
