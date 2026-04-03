import { describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AdminPage from '../app/admin/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/admin',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('../components/sidebar', () => ({
  Sidebar: () => createElement('aside', { 'data-testid': 'sidebar' }, 'Sidebar'),
}));

vi.mock('../lib/session-permissions', () => ({
  canManageAdminData: () => true,
}));

vi.mock('../app/admin/_components', () => ({
  AdminPageHeader: () => createElement('div', null, 'Header'),
  Pagination: () => createElement('div', null, 'Pagination'),
  DetailModal: () => null,
  ItemCard: () => createElement('tr', null),
  AdminSearchResultsOverlay: () => null,
  applyAdminSearchOverlayState: (_params: URLSearchParams) => new URLSearchParams(),
  createAdminListSearchParams: () => new URLSearchParams(),
  fetchAdminLocalSearchResults: vi.fn(),
  fetchAdminRemoteSearchResults: vi.fn(),
  readAdminListState: () => ({
    page: 1,
    pageSize: 20,
    sortBy: 'updated',
    viewMode: 'table',
  }),
  readAdminSearchOverlayState: () => ({
    open: false,
    keyword: '',
  }),
  shouldApplyAdminSearchResponse: () => true,
  shouldDisableAdminBackgroundInteractions: () => false,
  prepareRemoteSearchFallbackState: () => ({ open: false, keyword: '' }),
  writeAdminListPreferences: vi.fn(),
}));

describe('AdminPage layout', () => {
  it('keeps the sidebar outside the scrolling region and scrolls the main content independently', () => {
    const markup = renderToStaticMarkup(createElement(AdminPage));

    expect(markup).toContain('class="h-screen overflow-hidden flex animated-bg"');
    expect(markup).toContain('class="flex-1 min-w-0 h-screen overflow-y-auto p-6 relative z-10"');
  });
});
