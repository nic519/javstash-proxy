import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ViewToggle } from '../app/admin/_components/ViewToggle';
import { prepareRemoteSearchFallbackState } from '../app/admin/_components/types';
import type { Translation } from '../components/shared/types';

describe('ViewToggle', () => {
  it('renders both admin view modes and the active mode label', () => {
    const markup = renderToStaticMarkup(
      createElement(ViewToggle, {
        value: 'table',
        onChange: () => {},
      })
    );

    expect(markup).toContain('列表');
    expect(markup).toContain('网格');
    expect(markup).toContain('aria-pressed="true"');
    expect(markup).toContain('aria-pressed="false"');
  });
});

describe('prepareRemoteSearchFallbackState', () => {
  it('normalizes the search term and only seeds remote fallback state when local search is empty', () => {
    const localItems: Translation[] = [];

    expect(prepareRemoteSearchFallbackState('', localItems)).toEqual({
      open: false,
      keyword: '',
    });

    expect(prepareRemoteSearchFallbackState('   ', localItems)).toEqual({
      open: false,
      keyword: '',
    });

    expect(prepareRemoteSearchFallbackState('ABP-123', localItems)).toEqual({
      open: true,
      keyword: 'ABP-123',
    });

    expect(
      prepareRemoteSearchFallbackState('ABP-123', [
        {
          code: 'ABP-123',
          titleZh: 'Local title',
          summaryZh: 'Local summary',
        },
      ])
    ).toEqual({
      open: false,
      keyword: '',
    });
  });
});
