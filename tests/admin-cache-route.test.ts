import { beforeEach, describe, expect, it, vi } from 'vitest';

const clearAllMock = vi.fn();
const getStatsMock = vi.fn();
const getAppAuthStateMock = vi.fn();

vi.mock('@/lib/authz', () => ({
  getAppAuthState: getAppAuthStateMock,
}));

vi.mock('@/src/cache/turso', () => ({
  TursoCache: vi.fn().mockImplementation(function MockTursoCache() {
    return {
      clearAll: clearAllMock,
      getStats: getStatsMock,
    };
  }),
}));

vi.mock('@/src/config', () => ({
  loadConfig: vi.fn(() => ({
    tursoUrl: 'http://localhost',
    tursoAuthToken: 'token',
  })),
}));

describe('admin cache route', () => {
  beforeEach(() => {
    clearAllMock.mockReset();
    getStatsMock.mockReset();
    getAppAuthStateMock.mockReset();
  });

  it('returns cache stats without requiring admin permissions', async () => {
    getStatsMock.mockResolvedValue({ total: 12 });

    const { GET } = await import('../app/api/admin/cache/route');
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ total: 12 });
  });

  it('rejects non-admin cache deletion', async () => {
    getAppAuthStateMock.mockResolvedValue({
      authenticated: true,
      userId: 'user_member',
      email: 'member@example.com',
      isAdmin: false,
    });

    const { DELETE } = await import('../app/api/admin/cache/route');
    const response = await DELETE();

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: 'Forbidden' });
    expect(clearAllMock).not.toHaveBeenCalled();
  });

  it('allows admin cache deletion', async () => {
    getAppAuthStateMock.mockResolvedValue({
      authenticated: true,
      userId: 'user_admin',
      email: 'admin@example.com',
      isAdmin: true,
    });

    const { DELETE } = await import('../app/api/admin/cache/route');
    const response = await DELETE();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(clearAllMock).toHaveBeenCalledOnce();
  });
});
