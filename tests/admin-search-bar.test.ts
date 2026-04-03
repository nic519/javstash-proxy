import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SearchBar } from '../app/admin/_components/SearchBar';

describe('SearchBar', () => {
  it('renders a unified search control with a single search action icon', () => {
    const markup = renderToStaticMarkup(
      createElement(SearchBar, {
        value: 'ABP-123',
        onChange: () => {},
        onSearch: () => {},
      })
    );

    expect(markup).toContain('overflow-hidden');
    expect(markup).toContain('w-full');
    expect(markup).toContain('aria-label="搜索"');
    expect(markup).toContain('aria-label="清空输入框"');
    expect(markup).toContain('title="清空输入框"');
    expect(markup).not.toContain('aria-label="从剪切板复制"');
    expect(markup).not.toContain('title="从剪切板复制"');
    expect(markup.match(/lucide-search/g)).toHaveLength(1);
  });

  it('shows clear only when the input has a value', () => {
    const emptyMarkup = renderToStaticMarkup(
      createElement(SearchBar, {
        value: '',
        onChange: () => {},
        onSearch: () => {},
      })
    );

    const filledMarkup = renderToStaticMarkup(
      createElement(SearchBar, {
        value: 'ABP-123',
        onChange: () => {},
        onSearch: () => {},
      })
    );

    expect(emptyMarkup).not.toContain('aria-label="清空输入框"');
    expect(emptyMarkup).not.toContain('title="清空输入框"');
    expect(emptyMarkup).toContain('aria-label="搜索"');
    expect(filledMarkup).toContain('aria-label="清空输入框"');
    expect(filledMarkup).toContain('title="清空输入框"');
    expect(filledMarkup).toContain('aria-label="搜索"');
  });
});
