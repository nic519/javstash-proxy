import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const listRandomTranslationsMock = vi.fn();
const listTranslationsMock = vi.fn();
const getTranslationMock = vi.fn();
const updateTranslationMock = vi.fn();
const deleteTranslationMock = vi.fn();
const getAppAuthStateMock = vi.fn();

vi.mock('@/lib/authz', () => ({
  getAppAuthState: getAppAuthStateMock,
}));

vi.mock('@/src/cache/turso', () => ({
  TursoCache: vi.fn().mockImplementation(function MockTursoCache() {
    return {
      getTranslation: getTranslationMock,
      listRandomTranslations: listRandomTranslationsMock,
      listTranslations: listTranslationsMock,
      updateTranslation: updateTranslationMock,
      deleteTranslation: deleteTranslationMock,
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
    getTranslationMock.mockReset();
    updateTranslationMock.mockReset();
    deleteTranslationMock.mockReset();
    getAppAuthStateMock.mockReset();
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

  it('rejects non-admin translation updates', async () => {
    getAppAuthStateMock.mockResolvedValue({
      authenticated: true,
      userId: 'user_member',
      email: 'member@example.com',
      isAdmin: false,
    });

    const { PUT } = await import('../app/api/admin/translations/[code]/route');
    const request = new NextRequest('http://localhost/api/admin/translations/ABP-123', {
      method: 'PUT',
      body: JSON.stringify({ titleZh: '新的标题' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await PUT(request, { params: Promise.resolve({ code: 'ABP-123' }) });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: 'Forbidden' });
    expect(updateTranslationMock).not.toHaveBeenCalled();
  });

  it('allows admin translation updates', async () => {
    getAppAuthStateMock.mockResolvedValue({
      authenticated: true,
      userId: 'user_admin',
      email: 'admin@example.com',
      isAdmin: true,
    });

    const { PUT } = await import('../app/api/admin/translations/[code]/route');
    const request = new NextRequest('http://localhost/api/admin/translations/ABP-123', {
      method: 'PUT',
      body: JSON.stringify({ titleZh: '新的标题', summaryZh: '新的简介' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await PUT(request, { params: Promise.resolve({ code: 'ABP-123' }) });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(updateTranslationMock).toHaveBeenCalledWith('ABP-123', {
      titleZh: '新的标题',
      summaryZh: '新的简介',
    });
  });

  it('rejects non-admin translation deletes', async () => {
    getAppAuthStateMock.mockResolvedValue({
      authenticated: true,
      userId: 'user_member',
      email: 'member@example.com',
      isAdmin: false,
    });

    const { DELETE } = await import('../app/api/admin/translations/[code]/route');
    const request = new NextRequest('http://localhost/api/admin/translations/ABP-123', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ code: 'ABP-123' }) });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: 'Forbidden' });
    expect(deleteTranslationMock).not.toHaveBeenCalled();
  });

  it('allows admin translation deletes', async () => {
    getAppAuthStateMock.mockResolvedValue({
      authenticated: true,
      userId: 'user_admin',
      email: 'admin@example.com',
      isAdmin: true,
    });

    const { DELETE } = await import('../app/api/admin/translations/[code]/route');
    const request = new NextRequest('http://localhost/api/admin/translations/ABP-123', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ code: 'ABP-123' }) });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(deleteTranslationMock).toHaveBeenCalledWith('ABP-123');
  });
});
