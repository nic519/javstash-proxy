import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ViewToggle } from '../app/admin/_components/ViewToggle';
import {
  ADMIN_PAGE_SIZE_STORAGE_KEY,
  ADMIN_SORT_BY_STORAGE_KEY,
  ADMIN_VIEW_MODE_STORAGE_KEY,
  applyAdminSearchOverlayState,
  createAdminListSearchParams,
  prepareRemoteSearchFallbackState,
  readAdminListState,
  readAdminSearchOverlayState,
  readAdminViewMode,
  shouldDisableAdminBackgroundInteractions,
  writeAdminListPreferences,
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

describe('admin list state persistence helpers', () => {
  it('prefers URL values and only falls back to stored non-page preferences', () => {
    const state = readAdminListState({
      searchParams: new URLSearchParams('page=3&sortBy=code'),
      storage: {
        getItem: (key) => {
          if (key === ADMIN_PAGE_SIZE_STORAGE_KEY) {
            return '50';
          }

          if (key === ADMIN_VIEW_MODE_STORAGE_KEY) {
            return 'grid';
          }

          return null;
        },
      },
    });

    expect(state).toEqual({
      page: 3,
      pageSize: 50,
      sortBy: 'code',
      viewMode: 'grid',
    });
  });

  it('falls back to defaults when URL and storage values are invalid', () => {
    const state = readAdminListState({
      searchParams: new URLSearchParams('page=0&pageSize=999&sortBy=nope&viewMode=nope'),
      storage: {
        getItem: () => 'bad-value',
      },
    });

    expect(state).toEqual({
      page: 1,
      pageSize: 20,
      sortBy: 'updated',
      viewMode: 'table',
    });
  });

  it('writes only non-page list preferences into storage', () => {
    const calls: Array<[string, string]> = [];

    writeAdminListPreferences(
      {
        setItem: (key, value) => {
          calls.push([key, value]);
        },
      },
      {
        pageSize: 50,
        sortBy: 'code',
        viewMode: 'grid',
      }
    );

    expect(calls).toEqual([
      [ADMIN_PAGE_SIZE_STORAGE_KEY, '50'],
      [ADMIN_SORT_BY_STORAGE_KEY, 'code'],
      [ADMIN_VIEW_MODE_STORAGE_KEY, 'grid'],
    ]);
  });

  it('creates stable URL params for the admin list state', () => {
    const params = createAdminListSearchParams({
      page: 3,
      pageSize: 50,
      sortBy: 'code',
      viewMode: 'grid',
    });

    expect(params.toString()).toBe('page=3&pageSize=50&sortBy=code&viewMode=grid');
  });
});

describe('admin search overlay URL helpers', () => {
  it('reads a search overlay state from URL params', () => {
    expect(readAdminSearchOverlayState(new URLSearchParams('overlay=search&q= ABP-123 '))).toEqual({
      open: true,
      keyword: 'ABP-123',
    });

    expect(readAdminSearchOverlayState(new URLSearchParams('overlay=other&q=ABP-123'))).toEqual({
      open: false,
      keyword: '',
    });
  });

  it('adds and removes overlay params without disturbing list params', () => {
    const base = new URLSearchParams('page=3&pageSize=50&sortBy=code&viewMode=grid');

    expect(
      applyAdminSearchOverlayState(base, {
        open: true,
        keyword: 'SSIS-001',
      }).toString()
    ).toBe('page=3&pageSize=50&sortBy=code&viewMode=grid&overlay=search&q=SSIS-001');

    expect(
      applyAdminSearchOverlayState(
        new URLSearchParams('page=3&pageSize=50&sortBy=code&viewMode=grid&overlay=search&q=SSIS-001'),
        {
          open: false,
          keyword: '',
        }
      ).toString()
    ).toBe('page=3&pageSize=50&sortBy=code&viewMode=grid');
  });
});

describe('shouldDisableAdminBackgroundInteractions', () => {
  it('only disables background interactions while the remote modal is open', () => {
    expect(shouldDisableAdminBackgroundInteractions(false)).toBe(false);
    expect(shouldDisableAdminBackgroundInteractions(true)).toBe(true);
  });
});
