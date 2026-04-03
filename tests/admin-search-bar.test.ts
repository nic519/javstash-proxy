import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SearchBar } from '../app/admin/_components/SearchBar';

describe('SearchBar', () => {
  it('renders icon-only shortcuts for paste-from-clipboard and clear input', () => {
    const markup = renderToStaticMarkup(
      createElement(SearchBar, {
        value: 'ABP-123',
        onChange: () => {},
        onSearch: () => {},
      })
    );

    expect(markup).toContain('aria-label="从剪切板复制"');
    expect(markup).toContain('title="从剪切板复制"');
    expect(markup).toContain('aria-label="清空输入框"');
    expect(markup).toContain('title="清空输入框"');
  });
});
