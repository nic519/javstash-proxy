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

    expect(markup).toContain('class="w-72 h-screen shrink-0 sticky top-0 flex flex-col relative"');
    expect(markup).toContain('class="flex-1 min-h-0 overflow-y-auto p-4 space-y-1"');
  });
});
