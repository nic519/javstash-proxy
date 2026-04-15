import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TursoCache } from '../src/cache/turso.js';

const executeMock = vi.fn<any>(async (stmt: string | { sql: string }) => {
  const sql = typeof stmt === 'string' ? stmt : stmt.sql;

  if (sql.includes('SELECT')) {
    return {
      rows: [
        { code: 'SSIS-001', title_zh: '中文标题1', summary_zh: '中文简介1' },
        { code: 'SSIS-002', title_zh: '中文标题2', summary_zh: '中文简介2' },
      ],
    };
  }

  return { rows: [] };
});

// Mock @libsql/client
vi.mock('@libsql/client', () => ({
  createClient: () => ({
    execute: executeMock,
    batch: vi.fn(async () => []),
  }),
}));

describe('TursoCache', () => {
  beforeEach(() => {
    executeMock.mockClear();
  });

  it('should get translations by codes', async () => {
    const cache = new TursoCache('http://localhost', 'token');
    const result = await cache.getTranslations(['SSIS-001', 'SSIS-002']);

    expect(result).toHaveLength(2);
    expect(result[0].code).toBe('SSIS-001');
    expect(result[0].titleZh).toBe('中文标题1');
  });

  it('should return empty array for empty codes', async () => {
    const cache = new TursoCache('http://localhost', 'token');
    const result = await cache.getTranslations([]);

    expect(result).toEqual([]);
  });

  it('should list random translations with a limit', async () => {
    const cache = new TursoCache('http://localhost', 'token');

    const result = await cache.listRandomTranslations(20);

    expect(result).toHaveLength(2);
    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sql: expect.stringContaining('ORDER BY RANDOM() LIMIT ?'),
        args: [20],
      })
    );
  });

  it('stores multiple preset tags for the same user and item', async () => {
    executeMock.mockImplementation(async (stmt: any) => {
      const sql = typeof stmt === 'string' ? stmt : stmt.sql;

      if (sql.includes('SELECT item_code')) {
        return {
          rows: [
            {
              item_code: 'ABP-123',
              tag: 'favorite',
              created_at: '2026-04-07T00:00:00.000Z',
              updated_at: '2026-04-07T00:00:00.000Z',
            },
            {
              item_code: 'ABP-123',
              tag: 'watch_later',
              created_at: '2026-04-07T00:00:00.000Z',
              updated_at: '2026-04-07T00:00:00.000Z',
            },
          ],
        };
      }

      return { rows: [] };
    });

    const cache = new TursoCache('http://localhost', 'token');

    await cache.upsertUserItemTag({
      userEmail: 'user@example.com',
      itemCode: 'ABP-123',
      tag: 'watch_later',
    });
    await cache.upsertUserItemTag({
      userEmail: 'user@example.com',
      itemCode: 'ABP-123',
      tag: 'favorite',
    });

    await expect(
      cache.listUserItemTags({
        userEmail: 'user@example.com',
        itemCodes: ['ABP-123'],
      })
    ).resolves.toEqual([
      expect.objectContaining({ itemCode: 'ABP-123', tag: 'favorite' }),
      expect.objectContaining({ itemCode: 'ABP-123', tag: 'watch_later' }),
    ]);
  });

  it('reads a cached performer profile with structured arrays and full json', async () => {
    executeMock.mockImplementation(async (stmt: any) => {
      const sql = typeof stmt === 'string' ? stmt : stmt.sql;

      if (sql.includes('SELECT id, name') && sql.includes('FROM performers')) {
        return {
          rows: [
            {
              id: 'performer-1',
              name: '麻宮わかな',
              aliases_json: '["Wakana Asamiya","若宮エレナ"]',
              birth_date: '1998-01-25',
              height: 165,
              cup_size: 'E',
              band_size: 90,
              waist_size: 60,
              hip_size: 88,
              career_start_year: 2021,
              career_end_year: null,
              images_json: '[{"url":"https://example.com/a.jpg"}]',
              full_json: '{"id":"performer-1","name":"麻宮わかな","country":"JP"}',
              updated_at: '2026-04-16T00:00:00.000Z',
            },
          ],
        };
      }

      return { rows: [] };
    });

    const cache = new TursoCache('http://localhost', 'token');
    const result = await cache.getPerformer('performer-1');

    expect(result).toEqual({
      id: 'performer-1',
      name: '麻宮わかな',
      aliases: ['Wakana Asamiya', '若宮エレナ'],
      birth_date: '1998-01-25',
      height: 165,
      cup_size: 'E',
      band_size: 90,
      waist_size: 60,
      hip_size: 88,
      career_start_year: 2021,
      career_end_year: undefined,
      images: [{ url: 'https://example.com/a.jpg' }],
      full_json: {
        id: 'performer-1',
        name: '麻宮わかな',
        country: 'JP',
      },
      updated_at: '2026-04-16T00:00:00.000Z',
    });
  });

  it('upserts performer profiles into the performers table', async () => {
    const cache = new TursoCache('http://localhost', 'token');

    await cache.upsertPerformer({
      id: 'performer-1',
      name: '麻宮わかな',
      aliases: ['Wakana Asamiya'],
      birth_date: '1998-01-25',
      height: 165,
      cup_size: 'E',
      band_size: 90,
      waist_size: 60,
      hip_size: 88,
      career_start_year: 2021,
      career_end_year: undefined,
      images: [{ url: 'https://example.com/a.jpg' }],
      full_json: {
        id: 'performer-1',
        name: '麻宮わかな',
        country: 'JP',
      },
    });

    expect(executeMock).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS performers')
    );
    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sql: expect.stringContaining('INSERT INTO performers'),
        args: expect.arrayContaining([
          'performer-1',
          '麻宮わかな',
          '["Wakana Asamiya"]',
          '1998-01-25',
          165,
          'E',
          90,
          60,
          88,
          2021,
          null,
          '[{"url":"https://example.com/a.jpg"}]',
          '{"id":"performer-1","name":"麻宮わかな","country":"JP"}',
        ]),
      })
    );
  });
});
