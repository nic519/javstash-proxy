import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DeepLXTranslator } from '../src/translator/deeplx.js';

describe('DeepLXTranslator', () => {
  let fetchMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchMock = vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it('should translate batch of scenes', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({
        code: 200,
        data: '中文标题\n===@¥@¥===\n中文简介',
      }))
    );

    const translator = new DeepLXTranslator('http://deeplx.local');
    const result = await translator.translateBatch([
      { code: 'SSIS-001', title: '日本語タイトル', details: '日本語詳細' },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].code).toBe('SSIS-001');
    expect(result[0].titleZh).toBe('中文标题');
    expect(result[0].summaryZh).toBe('中文简介');
  });

  it('should return original text when translation fails', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ code: 500 }), { status: 500 })
    );

    const translator = new DeepLXTranslator('http://deeplx.local');
    const result = await translator.translateBatch([
      { code: 'SSIS-001', title: 'Original Title', details: 'Original Details' },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].titleZh).toBe('Original Title');
    expect(result[0].summaryZh).toBe('Original Details');
  });

  it('should handle empty batch', async () => {
    const translator = new DeepLXTranslator('http://deeplx.local');
    const result = await translator.translateBatch([]);

    expect(result).toEqual([]);
  });
});