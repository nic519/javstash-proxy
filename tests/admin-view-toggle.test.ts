import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ViewToggle } from '../app/admin/_components/ViewToggle';
import {
  ADMIN_VIEW_MODE_STORAGE_KEY,
  prepareRemoteSearchFallbackState,
  readAdminViewMode,
  shouldDisableAdminBackgroundInteractions,
  writeAdminViewMode,
} from '../app/admin/_components/types';
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

  it('marks both toggle actions as disabled when background interactions are frozen', () => {
    const markup = renderToStaticMarkup(
      createElement(ViewToggle, {
        value: 'grid',
        onChange: () => {},
        disabled: true,
      })
    );

    expect(markup).toContain('disabled=""');
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

describe('admin view mode persistence helpers', () => {
  it('reads a stored grid view mode and falls back to table for invalid values', () => {
    expect(readAdminViewMode({ getItem: () => 'grid' })).toBe('grid');
    expect(readAdminViewMode({ getItem: () => 'nope' })).toBe('table');
    expect(readAdminViewMode(null)).toBe('table');
  });

  it('writes the chosen view mode using the stable storage key', () => {
    const calls: Array<[string, string]> = [];

    writeAdminViewMode(
      {
        setItem: (key, value) => {
          calls.push([key, value]);
        },
      },
      'grid'
    );

    expect(calls).toEqual([[ADMIN_VIEW_MODE_STORAGE_KEY, 'grid']]);
  });
});

describe('shouldDisableAdminBackgroundInteractions', () => {
  it('only disables background interactions while the remote modal is open', () => {
    expect(shouldDisableAdminBackgroundInteractions(false)).toBe(false);
    expect(shouldDisableAdminBackgroundInteractions(true)).toBe(true);
  });
});
