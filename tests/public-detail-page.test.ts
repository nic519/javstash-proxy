import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const { getTranslationMock, notFoundMock } = vi.hoisted(() => ({
  getTranslationMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('@/src/cache/turso', () => ({
  TursoCache: vi.fn().mockImplementation(function MockTursoCache() {
    return {
      getTranslation: getTranslationMock,
    };
  }),
}));

vi.mock('@/src/config', () => ({
  loadLookupConfig: vi.fn(() => ({
    tursoUrl: 'http://localhost',
    tursoAuthToken: 'token',
    deeplxApiUrl: '',
  })),
}));

vi.mock('next/navigation', () => ({
  notFound: notFoundMock,
}));

import PublicDetailPage from '../app/v/[token]/page';
import { encodePublicCodeToken } from '../lib/public-code-token';

describe('public detail page', () => {
  beforeEach(() => {
    getTranslationMock.mockReset();
    notFoundMock.mockClear();
  });

  it('loads a translation by decoded code and renders its content', async () => {
    getTranslationMock.mockResolvedValue({
      code: 'ABP-123',
      titleZh: '公开标题',
      summaryZh: '公开简介',
      coverUrl: 'https://example.com/cover.jpg',
      rawResponse: JSON.stringify({ id: 'scene-1', code: 'ABP-123' }),
    });

    const element = await PublicDetailPage({
      params: Promise.resolve({ token: encodePublicCodeToken('ABP-123') }),
    });
    const markup = renderToStaticMarkup(createElement(() => element));

    expect(getTranslationMock).toHaveBeenCalledWith('ABP-123');
    expect(markup).toContain('公开标题');
    expect(markup).toContain('公开简介');
  });

  it('falls back to notFound when the token cannot be resolved', async () => {
    await expect(
      PublicDetailPage({
        params: Promise.resolve({ token: 'bad!' }),
      })
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFoundMock).toHaveBeenCalled();
    expect(getTranslationMock).not.toHaveBeenCalled();
  });
});
