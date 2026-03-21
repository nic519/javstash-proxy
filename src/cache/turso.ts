import { createClient } from '@libsql/client';
import type { Translation } from '../types';

export class TursoCache {
  private client;

  constructor(url: string, authToken: string) {
    this.client = createClient({ url, authToken });
  }

  /**
   * Get translations by codes from cache
   */
  async getTranslations(codes: string[]): Promise<Translation[]> {
    if (codes.length === 0) return [];

    const placeholders = codes.map(() => '?').join(',');
    const result = await this.client.execute({
      sql: `SELECT code, title_zh, summary_zh, cover_url FROM translations WHERE code IN (${placeholders})`,
      args: codes,
    });

    return result.rows.map((row) => ({
      code: row.code as string,
      titleZh: (row.title_zh as string) ?? '',
      summaryZh: (row.summary_zh as string) ?? '',
      coverUrl: (row.cover_url as string) ?? undefined,
    }));
  }

  /**
   * Save translations to cache
   */
  async saveBatch(translations: Translation[]): Promise<void> {
    if (translations.length === 0) return;

    const statements = translations.map((t) => ({
      sql: `INSERT INTO translations (code, title_zh, summary_zh, cover_url)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(code) DO UPDATE SET
              title_zh = excluded.title_zh,
              summary_zh = excluded.summary_zh,
              cover_url = excluded.cover_url`,
      args: [t.code, t.titleZh, t.summaryZh, t.coverUrl ?? null],
    }));

    await this.client.batch(statements, 'write');
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ cacheCount: number; lastUpdated: string }> {
    const result = await this.client.execute(
      'SELECT COUNT(*) as count FROM translations'
    );
    const count = result.rows[0]?.count as number ?? 0;

    return {
      cacheCount: count,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Clear all cache entries
   */
  async clearAll(): Promise<void> {
    await this.client.execute('DELETE FROM translations');
  }
}