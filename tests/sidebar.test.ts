import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Navigation } from '../components/Navigation';

vi.mock('next/link', () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) =>
    createElement('a', { href, className }, children),
}));

const push = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
  useRouter: () => ({ push }),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    push.mockReset();
  });

  it('renders a top navigation bar for desktop layouts', () => {
    const markup = renderToStaticMarkup(createElement(Navigation));

    expect(markup).toContain('class="hidden lg:flex sticky top-0 z-40 px-6 py-4"');
    expect(markup).toContain('Translation Console');
    expect(markup).toContain('justify-self-center');
    expect(markup).toContain('aria-label="主导航"');
    expect(markup).toContain('退出登录');
  });

  it('renders a compact mobile trigger and keeps the mobile drawer collapsed by default', () => {
    const markup = renderToStaticMarkup(createElement(Navigation));

    expect(markup).toContain('aria-label="打开工具面板"');
    expect(markup).toContain('class="fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition-all duration-300 lg:hidden"');
    expect(markup).toContain('class="absolute inset-x-0 bottom-0 flex max-h-[min(78dvh,40rem)] flex-col overflow-hidden rounded-t-[2rem] border transition-transform duration-300 ease-out translate-y-full"');
    expect(markup).toContain('导航');
    expect(markup).toContain('aria-hidden="true"');
  });

  it('renders mobile panel content when provided', () => {
    const markup = renderToStaticMarkup(
      createElement(Navigation, {
        mobilePanelContent: createElement('div', { 'data-testid': 'mobile-controls' }, 'Controls'),
      })
    );

    expect(markup).toContain('data-testid="mobile-controls"');
    expect(markup).toContain('Controls');
  });

  it('renders a collapsible desktop shell when a scroll container is provided', () => {
    const markup = renderToStaticMarkup(
      createElement(Navigation, {
        scrollContainerId: 'admin-list-scroll-container',
      })
    );

    expect(markup).toContain('data-scroll-target="admin-list-scroll-container"');
    expect(markup).toContain('max-h-28 opacity-100 translate-y-0');
  });
});
