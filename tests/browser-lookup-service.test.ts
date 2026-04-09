import { beforeEach, describe, expect, it, vi } from 'vitest';

const getTranslationsMock = vi.fn();
const saveBatchMock = vi.fn();
const updateTranslationMock = vi.fn();
const translateBatchMock = vi.fn();
const loadLookupConfigMock = vi.fn();

vi.mock('@/src/config', () => ({
  loadLookupConfig: loadLookupConfigMock,
}));

vi.mock('@/src/cache/turso', () => ({
  TursoCache: vi.fn().mockImplementation(function MockTursoCache() {
    return {
      getTranslations: getTranslationsMock,
      saveBatch: saveBatchMock,
      updateTranslation: updateTranslationMock,
    };
  }),
}));

vi.mock('@/src/translator/deeplx', () => ({
  DeepLXTranslator: vi.fn().mockImplementation(function MockDeepLXTranslator() {
    return {
      translateBatch: translateBatchMock,
    };
  }),
}));

describe('browser lookup service', () => {
  beforeEach(() => {
    getTranslationsMock.mockReset();
    saveBatchMock.mockReset();
    updateTranslationMock.mockReset();
    translateBatchMock.mockReset();
    loadLookupConfigMock.mockReset();
    loadLookupConfigMock.mockReturnValue({
      tursoUrl: 'http://localhost',
      tursoAuthToken: 'token',
      deeplxApiUrl: 'http://deeplx.local',
    });
    vi.restoreAllMocks();
  });

  it('normalizes the incoming code and returns the exact translated scene match', async () => {
    getTranslationsMock.mockResolvedValue([]);
    saveBatchMock.mockResolvedValue(undefined);
    updateTranslationMock.mockResolvedValue(undefined);
    translateBatchMock.mockResolvedValue([
      {
        code: 'SSIS-828',
        titleZh: '中文标题',
        summaryZh: '中文简介',
      },
      {
        code: 'SSIS-829',
        titleZh: '别的中文标题',
        summaryZh: '别的中文简介',
      },
    ]);

    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        data: {
          searchScene: [
            { code: 'SSIS-828', title: '日文标题', details: '日文简介' },
            { code: 'SSIS-829', title: '别的标题', details: '别的简介' },
          ],
        },
      }))
    );

    const { lookupSceneByCode } = await import('../src/browser/lookup');
    const result = await lookupSceneByCode('ssis-828', 'user-key');

    expect(result).toEqual({
      code: 'SSIS-828',
      title: '中文标题',
      description: '中文简介',
      translated: true,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://javstash.org/graphql',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          ApiKey: 'user-key',
        }),
        body: expect.stringContaining('"term":"SSIS-828"'),
      })
    );
  });

  it('throws a not found error when no exact code match is returned', async () => {
    getTranslationsMock.mockResolvedValue([]);
    saveBatchMock.mockResolvedValue(undefined);
    updateTranslationMock.mockResolvedValue(undefined);
    translateBatchMock.mockResolvedValue([
      {
        code: 'SSIS-829',
        titleZh: '别的中文标题',
        summaryZh: '别的中文简介',
      },
    ]);

    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        data: {
          searchScene: [
            { code: 'SSIS-829', title: '别的标题', details: '别的简介' },
          ],
        },
      }))
    );

    const { lookupSceneByCode } = await import('../src/browser/lookup');

    await expect(lookupSceneByCode('SSIS-828', 'user-key')).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Scene not found for code SSIS-828',
    });
  });
});
