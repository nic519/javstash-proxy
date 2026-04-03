import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DetailModal } from '../components/shared/DetailModal';

const item = {
  code: 'ABP-123',
  titleZh: '标题',
  summaryZh: '简介',
  coverUrl: 'https://example.com/cover.jpg',
};

describe('DetailModal permissions', () => {
  it('hides edit and delete actions in read-only mode', () => {
    const markup = renderToStaticMarkup(
      createElement(DetailModal, {
        item,
        onClose: () => {},
        readOnly: true,
      })
    );

    expect(markup).not.toContain('title="编辑"');
    expect(markup).not.toContain('title="删除"');
    expect(markup).toContain('title="关闭"');
  });

  it('shows edit and delete actions when write access is enabled', () => {
    const markup = renderToStaticMarkup(
      createElement(DetailModal, {
        item,
        onClose: () => {},
        onUpdate: () => {},
        onDelete: () => {},
        readOnly: false,
      })
    );

    expect(markup).toContain('title="编辑"');
    expect(markup).toContain('title="删除"');
  });
});
