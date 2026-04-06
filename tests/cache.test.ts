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
});
