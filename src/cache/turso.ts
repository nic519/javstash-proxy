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
      sql: `SELECT code, title_zh, summary_zh, cover_url, raw_response FROM translations WHERE code IN (${placeholders})`,
      args: codes,
    });

    return result.rows.map((row) => ({
      code: row.code as string,
      titleZh: (row.title_zh as string) ?? '',
      summaryZh: (row.summary_zh as string) ?? '',
      coverUrl: (row.cover_url as string) ?? undefined,
      rawResponse: (row.raw_response as string) ?? undefined,
    }));
  }

  /**
   * Save translations to cache
   */
  async saveBatch(translations: Translation[]): Promise<void> {
    if (translations.length === 0) return;

    const now = new Date().toISOString();
    const statements = translations.map((t) => ({
      sql: `INSERT INTO translations (code, title_zh, summary_zh, cover_url, raw_response, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(code) DO UPDATE SET
              title_zh = excluded.title_zh,
              summary_zh = excluded.summary_zh,
              cover_url = excluded.cover_url,
              raw_response = excluded.raw_response,
              updated_at = excluded.updated_at`,
      args: [t.code, t.titleZh, t.summaryZh, t.coverUrl ?? null, t.rawResponse ?? null, now],
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

  /**
   * List translations with pagination, search and sorting
   */
  async listTranslations(options: {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: 'updated' | 'code';
  }): Promise<{ items: Translation[]; total: number }> {
    const offset = (options.page - 1) * options.pageSize;
    const searchCondition = options.search
      ? `WHERE code LIKE ? OR title_zh LIKE ? OR summary_zh LIKE ?`
      : '';
    const searchArgs = options.search
      ? [`%${options.search}%`, `%${options.search}%`, `%${options.search}%`]
      : [];

    // Determine sort order
    const sortBy = options.sortBy || 'updated';
    const orderBy = sortBy === 'code'
      ? 'ORDER BY code ASC'
      : 'ORDER BY updated_at DESC';

    // Get total count
    const countResult = await this.client.execute({
      sql: `SELECT COUNT(*) as count FROM translations ${searchCondition}`,
      args: searchArgs,
    });
    const total = countResult.rows[0]?.count as number ?? 0;

    // Get items
    const result = await this.client.execute({
      sql: `SELECT code, title_zh, summary_zh, cover_url, raw_response, updated_at FROM translations ${searchCondition}
            ${orderBy} LIMIT ? OFFSET ?`,
      args: [...searchArgs, options.pageSize, offset],
    });

    return {
      items: result.rows.map((row) => ({
        code: row.code as string,
        titleZh: (row.title_zh as string) ?? '',
        summaryZh: (row.summary_zh as string) ?? '',
        coverUrl: (row.cover_url as string) ?? undefined,
        rawResponse: (row.raw_response as string) ?? undefined,
        updatedAt: (row.updated_at as string) ?? undefined,
      })),
      total,
    };
  }

  /**
   * Get a single translation by code
   */
  async getTranslation(code: string): Promise<Translation | null> {
    const result = await this.client.execute({
      sql: 'SELECT code, title_zh, summary_zh, cover_url, raw_response FROM translations WHERE code = ?',
      args: [code],
    });

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      code: row.code as string,
      titleZh: (row.title_zh as string) ?? '',
      summaryZh: (row.summary_zh as string) ?? '',
      coverUrl: (row.cover_url as string) ?? undefined,
      rawResponse: (row.raw_response as string) ?? undefined,
    };
  }

  /**
   * Update a single translation
   */
  async updateTranslation(code: string, data: Partial<Omit<Translation, 'code'>>): Promise<void> {
    const updates: string[] = [];
    const args: (string | null)[] = [];

    if (data.titleZh !== undefined) {
      updates.push('title_zh = ?');
      args.push(data.titleZh);
    }
    if (data.summaryZh !== undefined) {
      updates.push('summary_zh = ?');
      args.push(data.summaryZh);
    }
    if (data.coverUrl !== undefined) {
      updates.push('cover_url = ?');
      args.push(data.coverUrl || null);
    }
    if (data.rawResponse !== undefined) {
      updates.push('raw_response = ?');
      args.push(data.rawResponse || null);
    }

    if (updates.length === 0) return;

    args.push(code);
    await this.client.execute({
      sql: `UPDATE translations SET ${updates.join(', ')} WHERE code = ?`,
      args,
    });
  }

  /**
   * Delete a single translation by code
   */
  async deleteTranslation(code: string): Promise<void> {
    await this.client.execute({
      sql: 'DELETE FROM translations WHERE code = ?',
      args: [code],
    });
  }

  /**
   * Check if all codes have raw_response cached
   * Returns missing codes (those without raw_response)
   */
  async getMissingRawResponses(codes: string[]): Promise<string[]> {
    if (codes.length === 0) return [];

    const placeholders = codes.map(() => '?').join(',');
    const result = await this.client.execute({
      sql: `SELECT code FROM translations WHERE code IN (${placeholders}) AND raw_response IS NOT NULL`,
      args: codes,
    });

    const cachedCodes = new Set(result.rows.map((row) => row.code as string));
    return codes.filter((code) => !cachedCodes.has(code));
  }
}