import { describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import HomePage from '../app/page';

describe('HomePage auth area', () => {
  it('shows public access guidance plus links to protected tools', () => {
    const markup = renderToStaticMarkup(createElement(HomePage));

    expect(markup).toContain('公开页面无需登录');
    expect(markup).toContain('进入控制台');
    expect(markup).toContain('打开 Playground');
    expect(markup).toContain('通过 Discord 申请上游 ApiKey');
  });
});
