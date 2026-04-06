import { describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const authState = vi.hoisted(() => ({
  isSignedIn: false,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@clerk/nextjs', () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) =>
    createElement('div', { 'data-testid': 'clerk-sign-in' }, children),
  SignUpButton: ({ children }: { children: React.ReactNode }) =>
    createElement('div', { 'data-testid': 'clerk-sign-up' }, children),
  UserButton: () => createElement('div', { 'data-testid': 'clerk-user-button' }, 'Account'),
  useAuth: () => authState,
}));

import HomePage from '../app/page';

describe('HomePage auth area', () => {
  it('shows Clerk sign-in and sign-up affordances when signed out', () => {
    authState.isSignedIn = false;

    const markup = renderToStaticMarkup(createElement(HomePage));

    expect(markup).toContain('data-testid="clerk-sign-up"');
    expect(markup).toContain('data-testid="clerk-sign-in"');
    expect(markup).toContain('注册后进入调试');
    expect(markup).toContain('已有账号登录');
    expect(markup).not.toContain('管理员密码');
    expect(markup).not.toContain('粘贴 API Key');
    expect(markup).not.toContain('获取 API Key');
    expect(markup).not.toContain('验证中');
    expect(markup).toContain('通过 Discord 申请上游 ApiKey');
  });

  it('shows the signed-in console entry and account menu when signed in', () => {
    authState.isSignedIn = true;

    const markup = renderToStaticMarkup(createElement(HomePage));

    expect(markup).toContain('进入控制台');
    expect(markup).toContain('data-testid="clerk-user-button"');
    expect(markup).toContain('通过 Discord 申请上游 ApiKey');
    expect(markup).not.toContain('data-testid="clerk-sign-up"');
    expect(markup).not.toContain('data-testid="clerk-sign-in"');
  });
});
