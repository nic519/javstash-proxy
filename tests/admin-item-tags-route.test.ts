import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const getAppAuthStateMock = vi.fn();
const listUserItemTagsMock = vi.fn();
const upsertUserItemTagMock = vi.fn();
const deleteUserItemTagMock = vi.fn();
const getTranslationsMock = vi.fn();

vi.mock('@/lib/authz', () => ({
  getAppAuthState: getAppAuthStateMock,
}));

vi.mock('@/src/cache/turso', () => ({
  TursoCache: vi.fn().mockImplementation(function MockTursoCache() {
    return {
      listUserItemTags: listUserItemTagsMock,
      upsertUserItemTag: upsertUserItemTagMock,
      deleteUserItemTag: deleteUserItemTagMock,
      getTranslations: getTranslationsMock,
    };
  }),
}));

vi.mock('@/src/config', () => ({
  loadConfig: vi.fn(() => ({
    tursoUrl: 'http://localhost',
    tursoAuthToken: 'token',
  })),
}));

describe('/api/admin/item-tags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthenticated requests', async () => {
    getAppAuthStateMock.mockResolvedValue({
      authenticated: false,
      userId: null,
      email: null,
      isAdmin: false,
    });

    const { GET } = await import('../app/api/admin/item-tags/route');
    const response = await GET(new NextRequest('http://localhost/api/admin/item-tags'));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('lists tags for the current authenticated email', async () => {
    getAppAuthStateMock.mockResolvedValue({
      authenticated: true,
      userId: 'user_member',
      email: 'member@example.com',
      isAdmin: false,
    });
    listUserItemTagsMock.mockResolvedValue([
      {
        itemCode: 'ABP-123',
        tag: 'watch_later',
        createdAt: '2026-04-07T00:00:00.000Z',
        updatedAt: '2026-04-07T00:00:00.000Z',
      },
    ]);
    getTranslationsMock.mockResolvedValue([
      { code: 'ABP-123', titleZh: '标题', summaryZh: '简介' },
    ]);

    const { GET } = await import('../app/api/admin/item-tags/route');
    const response = await GET(
      new NextRequest('http://localhost/api/admin/item-tags?tag=watch_later')
    );

    expect(response.status).toBe(200);
    expect(listUserItemTagsMock).toHaveBeenCalledWith({
      userEmail: 'member@example.com',
      tag: 'watch_later',
    });
  });

  it('rejects invalid preset tags on write', async () => {
    getAppAuthStateMock.mockResolvedValue({
      authenticated: true,
      userId: 'user_member',
      email: 'member@example.com',
      isAdmin: false,
    });

    const { PUT } = await import('../app/api/admin/item-tags/route');
    const response = await PUT(
      new NextRequest('http://localhost/api/admin/item-tags', {
        method: 'PUT',
        body: JSON.stringify({ code: 'ABP-123', tag: 'unknown' }),
        headers: { 'content-type': 'application/json' },
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid tag' });
    expect(upsertUserItemTagMock).not.toHaveBeenCalled();
  });
});
