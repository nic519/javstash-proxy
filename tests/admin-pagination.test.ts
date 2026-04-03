import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Pagination } from '../app/admin/_components/Pagination';

describe('Admin Pagination', () => {
  it('renders the total count inside the sticky bottom pagination bar', () => {
    const markup = renderToStaticMarkup(
      createElement(Pagination, {
        page: 2,
        totalPages: 8,
        totalItems: 128,
        pageSize: 20,
        onPageChange: () => {},
        onPageSizeChange: () => {},
      })
    );

    expect(markup).toContain('sticky bottom-0 z-20');
    expect(markup).toContain('总计 128 条');
    expect(markup).toContain('共 8 页');
    expect(markup).toContain('跳转');
    expect(markup).toContain('placeholder="2"');
  });

  it('renders a compact pagination mode with centered page chips, total pages, and jump controls', () => {
    const markup = renderToStaticMarkup(
      createElement(Pagination, {
        page: 4,
        totalPages: 8,
        totalItems: 128,
        pageSize: 20,
        variant: 'compact',
        onPageChange: () => {},
        onPageSizeChange: () => {},
      })
    );

    expect(markup).toContain('justify-center');
    expect(markup).toContain('data-compact-pagination="true"');
    expect(markup).toContain('>2<');
    expect(markup).toContain('>3<');
    expect(markup).toContain('>4<');
    expect(markup).toContain('>5<');
    expect(markup).toContain('>6<');
    expect(markup).toContain('共 8 页');
    expect(markup).toContain('placeholder="4"');
    expect(markup).toContain('>GO<');
    expect(markup).not.toContain('总计 128 条');
    expect(markup).not.toContain('20 条');
    expect(markup).not.toContain('上一页');
    expect(markup).not.toContain('下一页');
  });

  it('renders responsive pagination with compact mobile content and full desktop controls', () => {
    const markup = renderToStaticMarkup(
      createElement(Pagination, {
        page: 2,
        totalPages: 8,
        totalItems: 128,
        pageSize: 20,
        variant: 'responsive',
        onPageChange: () => {},
        onPageSizeChange: () => {},
      })
    );

    expect(markup).toContain('md:hidden');
    expect(markup).toContain('hidden md:flex');
    expect(markup).toContain('data-compact-pagination="true"');
    expect(markup).toContain('总计 128 条');
    expect(markup).not.toContain('>8<');
  });

  it('returns null when there is only one page', () => {
    const markup = renderToStaticMarkup(
      createElement(Pagination, {
        page: 1,
        totalPages: 1,
        totalItems: 10,
        pageSize: 10,
        onPageChange: () => {},
        onPageSizeChange: () => {},
      })
    );

    expect(markup).toBe('');
  });
});
