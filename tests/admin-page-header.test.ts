import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdminPageHeader } from '../app/admin/_components/AdminPageHeader';

describe('AdminPageHeader', () => {
  it('renders the compact workspace header without control widgets', () => {
    const markup = renderToStaticMarkup(
      createElement(AdminPageHeader, {
        total: 128,
      })
    );

    expect(markup).toContain('Admin Workspace');
    expect(markup).toContain('底部分页会持续固定显示');
    expect(markup).not.toContain('128 条');
    expect(markup).not.toContain('随机模式');
    expect(markup).not.toContain('排序');
  });
});
