import { describe, it, expect, vi } from 'vitest';
import { TursoCache } from '../src/cache/turso.js';

// Mock @libsql/client
vi.mock('@libsql/client', () => ({
  createClient: () => ({
    execute: vi.fn(async (stmt) => {
      if (stmt.sql.includes('SELECT')) {
        return {
          rows: [
            { code: 'SSIS-001', title_zh: '中文标题1', summary_zh: '中文简介1' },
            { code: 'SSIS-002', title_zh: '中文标题2', summary_zh: '中文简介2' },
          ],
        };
      }
      return { rows: [] };
    }),
    batch: vi.fn(async () => []),
  }),
}));

describe('TursoCache', () => {
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
});