import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Sidebar } from '../components/sidebar';

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

  it('keeps the sidebar pinned to the viewport and makes the navigation list independently scrollable', () => {
    const markup = renderToStaticMarkup(createElement(Sidebar));

    expect(markup).toContain('class="hidden lg:flex w-72 h-screen shrink-0 sticky top-0 flex-col relative"');
    expect(markup).toContain('class="flex-1 min-h-0 overflow-y-auto p-4 space-y-1"');
  });

  it('renders a floating mobile trigger and keeps the mobile drawer collapsed by default', () => {
    const markup = renderToStaticMarkup(createElement(Sidebar));

    expect(markup).toContain('aria-label="打开导航菜单"');
    expect(markup).toContain('class="fixed left-4 bottom-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border shadow-lg transition-all duration-300 lg:hidden"');
    expect(markup).toContain('class="absolute left-0 top-0 flex h-dvh w-72 max-w-[82vw] flex-col transition-transform duration-300 ease-out -translate-x-full"');
    expect(markup).toContain('aria-hidden="true"');
  });
});
