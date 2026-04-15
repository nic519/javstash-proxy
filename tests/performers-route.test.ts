import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const getOrFetchPerformerMock = vi.fn();

vi.mock('@/src/performers', () => ({
  getOrFetchPerformer: getOrFetchPerformerMock,
}));

vi.mock('@/src/cache/turso', () => ({
  TursoCache: vi.fn().mockImplementation(function MockTursoCache() {
    return {};
  }),
}));

vi.mock('@/src/config', () => ({
  loadConfig: vi.fn(() => ({
    javstashApiKey: 'api-key',
    tursoUrl: 'http://localhost',
    tursoAuthToken: 'token',
  })),
}));

describe('performers route', () => {
  beforeEach(() => {
    getOrFetchPerformerMock.mockReset();
  });

  it('returns cached or fetched performer data', async () => {
    getOrFetchPerformerMock.mockResolvedValue({
      id: 'performer-1',
      name: '麻宮わかな',
      aliases: ['Wakana Asamiya'],
      images: [],
      full_json: { id: 'performer-1' },
      updated_at: '2026-04-16T00:00:00.000Z',
    });

    const { GET } = await import('../app/api/performers/[id]/route');
    const response = await GET(
      new NextRequest('http://localhost/api/performers/performer-1'),
      { params: Promise.resolve({ id: 'performer-1' }) }
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      performer: expect.objectContaining({
        id: 'performer-1',
        name: '麻宮わかな',
      }),
    });
    expect(getOrFetchPerformerMock).toHaveBeenCalledWith('performer-1', expect.anything(), 'api-key');
  });

  it('returns 404 when performer cannot be found', async () => {
    getOrFetchPerformerMock.mockResolvedValue(null);

    const { GET } = await import('../app/api/performers/[id]/route');
    const response = await GET(
      new NextRequest('http://localhost/api/performers/performer-404'),
      { params: Promise.resolve({ id: 'performer-404' }) }
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'NOT_FOUND',
    });
  });
});
