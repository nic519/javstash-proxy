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

    expect(markup).toContain('class="hidden lg:flex sticky top-0 z-40 items-center justify-between px-6 py-4"');
    expect(markup).toContain('Navigation');
  });

  it('renders a compact mobile trigger and keeps the mobile drawer collapsed by default', () => {
    const markup = renderToStaticMarkup(createElement(Navigation));

    expect(markup).toContain('aria-label="打开导航菜单"');
    expect(markup).toContain('class="fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition-all duration-300 lg:hidden"');
    expect(markup).toContain('class="absolute right-0 top-0 flex h-dvh w-72 max-w-[82vw] flex-col transition-transform duration-300 ease-out translate-x-full"');
    expect(markup).toContain('aria-hidden="true"');
  });
});
