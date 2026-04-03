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

  it('keeps the controls collapsed behind a mobile toggle by default', () => {
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

    expect(markup).toContain('aria-controls="admin-page-controls-panel"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('lg:hidden');
    expect(markup).toContain('筛选');
    expect(markup).toContain('overflow-hidden transition-all duration-300 ease-out');
    expect(markup).toContain('max-h-0 opacity-0 pointer-events-none lg:pointer-events-auto');
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
