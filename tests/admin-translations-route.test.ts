import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const listRandomTranslationsMock = vi.fn();
const listTranslationsMock = vi.fn();

vi.mock('@/src/cache/turso', () => ({
  TursoCache: vi.fn().mockImplementation(function MockTursoCache() {
    return {
      listRandomTranslations: listRandomTranslationsMock,
      listTranslations: listTranslationsMock,
    };
  }),
}));

vi.mock('@/src/config', () => ({
  loadConfig: vi.fn(() => ({
    tursoUrl: 'http://localhost',
    tursoAuthToken: 'token',
  })),
}));

describe('admin translations route', () => {
  beforeEach(() => {
    listRandomTranslationsMock.mockReset();
    listTranslationsMock.mockReset();
  });

  it('always uses 20 items in random mode regardless of requested page size', async () => {
    listRandomTranslationsMock.mockResolvedValue([
      { code: 'ABP-123', titleZh: '标题', summaryZh: '简介' },
    ]);

    const { GET } = await import('../app/api/admin/translations/route');
    const request = new NextRequest(
      'http://localhost/api/admin/translations?random=true&pageSize=100'
    );

    const response = await GET(request);
    const payload = await response.json();

    expect(listRandomTranslationsMock).toHaveBeenCalledWith(20);
    expect(payload.total).toBe(1);
  });

  it('keeps non-random requests using the requested page size', async () => {
    listTranslationsMock.mockResolvedValue({
      items: [],
      total: 0,
    });

    const { GET } = await import('../app/api/admin/translations/route');
    const request = new NextRequest(
      'http://localhost/api/admin/translations?page=2&pageSize=50&sortBy=code'
    );

    await GET(request);

    expect(listTranslationsMock).toHaveBeenCalledWith({
      page: 2,
      pageSize: 50,
      search: undefined,
      sortBy: 'code',
    });
  });
});
