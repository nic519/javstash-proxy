import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const lookupSceneByCodeMock = vi.fn();

vi.mock('@/src/browser/lookup', () => ({
  lookupSceneByCode: lookupSceneByCodeMock,
}));

describe('browser lookup route', () => {
  beforeEach(() => {
    lookupSceneByCodeMock.mockReset();
    vi.resetModules();
  });

  it('returns 401 when the browser lookup api key header is missing', async () => {
    const { GET } = await import('../app/api/browser/lookup/route');
    const response = await GET(
      new NextRequest('http://localhost/api/browser/lookup?code=SSIS-828')
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'MISSING_API_KEY',
      message: 'Missing JavStash ApiKey',
    });
    expect(lookupSceneByCodeMock).not.toHaveBeenCalled();
  });

  it('returns 400 when code is missing', async () => {
    const { GET } = await import('../app/api/browser/lookup/route');
    const response = await GET(
      new NextRequest('http://localhost/api/browser/lookup', {
        headers: { 'x-javstash-api-key': 'user-key' },
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'INVALID_CODE',
      message: 'Missing or invalid scene code',
    });
    expect(lookupSceneByCodeMock).not.toHaveBeenCalled();
  });

  it('returns translated lookup data for an exact scene code match', async () => {
    lookupSceneByCodeMock.mockResolvedValue({
      code: 'SSIS-828',
      title: '中文标题',
      description: '中文简介',
      translated: true,
    });

    const { GET } = await import('../app/api/browser/lookup/route');
    const response = await GET(
      new NextRequest('http://localhost/api/browser/lookup?code=ssis-828', {
        headers: { 'x-javstash-api-key': 'user-key' },
      })
    );

    expect(lookupSceneByCodeMock).toHaveBeenCalledWith('ssis-828', 'user-key');
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      code: 'SSIS-828',
      title: '中文标题',
      description: '中文简介',
      translated: true,
      source: 'javstash-proxy',
    });
  });

  it('maps browser lookup errors to structured json responses', async () => {
    const error = Object.assign(new Error('Scene not found for code SSIS-828'), {
      code: 'NOT_FOUND',
      status: 404,
    });
    lookupSceneByCodeMock.mockRejectedValue(error);

    const { GET } = await import('../app/api/browser/lookup/route');
    const response = await GET(
      new NextRequest('http://localhost/api/browser/lookup?code=SSIS-828', {
        headers: { 'x-javstash-api-key': 'user-key' },
      })
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'NOT_FOUND',
      message: 'Scene not found for code SSIS-828',
    });
  });
});
