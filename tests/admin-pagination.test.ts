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
