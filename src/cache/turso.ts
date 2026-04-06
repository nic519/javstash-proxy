import { createClient } from '@libsql/client';
import type { Translation } from '../types';
import type { UserItemTag, UserItemTagRecord } from '../../components/shared/types';

/**
 * Turso 缓存访问层。
 * 负责对翻译结果和原始响应做统一的读写操作。
 */
export class TursoCache {
  private client;
  private userItemTagsSchemaReady: Promise<void> | null = null;

  /**
   * @param url Turso 数据库地址
   * @param authToken Turso 访问令牌
   */
  constructor(url: string, authToken: string) {
    this.client = createClient({ url, authToken });
  }

  private async ensureUserItemTagsTable(): Promise<void> {
    if (!this.userItemTagsSchemaReady) {
      this.userItemTagsSchemaReady = (async () => {
        await this.client.execute(`
          CREATE TABLE IF NOT EXISTS user_item_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT NOT NULL,
            item_code TEXT NOT NULL,
            tag TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE(user_email, item_code, tag)
          )
        `);
        await this.client.execute(`
          CREATE INDEX IF NOT EXISTS idx_user_item_tags_user_tag_updated
          ON user_item_tags (user_email, tag, updated_at DESC)
        `);
        await this.client.execute(`
          CREATE INDEX IF NOT EXISTS idx_user_item_tags_user_item
          ON user_item_tags (user_email, item_code)
        `);
      })();
    }

    await this.userItemTagsSchemaReady;
  }

  private normalizeUserItemTag(tag: string): UserItemTag {
    return tag === 'deleted' ? 'dislike' : (tag as UserItemTag);
  }

  /**
   * 根据片号批量查询缓存翻译结果。
   */
  async getTranslations(codes: string[]): Promise<Translation[]> {
    if (codes.length === 0) return [];

    // 动态生成 IN 查询占位符，兼容任意数量的片号。
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
   * 批量写入翻译结果。
   * 若片号已存在，则覆盖最新的中文内容、封面和原始响应。
   */
  async saveBatch(translations: Translation[]): Promise<void> {
    if (translations.length === 0) return;

    // 统一使用同一个时间戳，方便后续排序和排查。
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
   * 获取缓存统计信息。
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
   * 清空全部缓存。
   */
  async clearAll(): Promise<void> {
    await this.client.execute('DELETE FROM translations');
  }

  /**
   * 分页查询缓存列表，支持搜索和排序。
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

    // 根据调用方指定的字段决定排序方式。
    const sortBy = options.sortBy || 'updated';
    const orderBy = sortBy === 'code'
      ? 'ORDER BY code ASC'
      : 'ORDER BY updated_at DESC';

    // 先查询总数，便于前端做分页。
    const countResult = await this.client.execute({
      sql: `SELECT COUNT(*) as count FROM translations ${searchCondition}`,
      args: searchArgs,
    });
    const total = countResult.rows[0]?.count as number ?? 0;

    // 再查询当前页数据。
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
   * 随机返回一组翻译记录。
   */
  async listRandomTranslations(limit: number): Promise<Translation[]> {
    const result = await this.client.execute({
      sql: `SELECT code, title_zh, summary_zh, cover_url, raw_response, updated_at FROM translations
            ORDER BY RANDOM() LIMIT ?`,
      args: [limit],
    });

    return result.rows.map((row) => ({
      code: row.code as string,
      titleZh: (row.title_zh as string) ?? '',
      summaryZh: (row.summary_zh as string) ?? '',
      coverUrl: (row.cover_url as string) ?? undefined,
      rawResponse: (row.raw_response as string) ?? undefined,
      updatedAt: (row.updated_at as string) ?? undefined,
    }));
  }

  /**
   * 按片号读取单条翻译记录。
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

  async upsertUserItemTag({
    userEmail,
    itemCode,
    tag,
  }: {
    userEmail: string;
    itemCode: string;
    tag: UserItemTag;
  }): Promise<void> {
    await this.ensureUserItemTagsTable();

    const normalizedTag = this.normalizeUserItemTag(tag);
    const now = new Date().toISOString();

    if (normalizedTag === 'dislike') {
      await this.client.execute({
        sql: 'DELETE FROM user_item_tags WHERE user_email = ? AND item_code = ? AND tag = ?',
        args: [userEmail, itemCode, 'deleted'],
      });
    }

    await this.client.execute({
      sql: `INSERT INTO user_item_tags (user_email, item_code, tag, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(user_email, item_code, tag) DO UPDATE SET
              updated_at = excluded.updated_at`,
      args: [userEmail, itemCode, normalizedTag, now, now],
    });
  }

  async deleteUserItemTag({
    userEmail,
    itemCode,
    tag,
  }: {
    userEmail: string;
    itemCode: string;
    tag: UserItemTag;
  }): Promise<void> {
    await this.ensureUserItemTagsTable();

    const normalizedTag = this.normalizeUserItemTag(tag);

    await this.client.execute({
      sql: normalizedTag === 'dislike'
        ? 'DELETE FROM user_item_tags WHERE user_email = ? AND item_code = ? AND tag IN (?, ?)'
        : 'DELETE FROM user_item_tags WHERE user_email = ? AND item_code = ? AND tag = ?',
      args: normalizedTag === 'dislike'
        ? [userEmail, itemCode, normalizedTag, 'deleted']
        : [userEmail, itemCode, normalizedTag],
    });
  }

  async listUserItemTags({
    userEmail,
    tag,
    itemCodes,
  }: {
    userEmail: string;
    tag?: UserItemTag;
    itemCodes?: string[];
  }): Promise<UserItemTagRecord[]> {
    await this.ensureUserItemTagsTable();

    const conditions = ['user_email = ?'];
    const args: (string | number)[] = [userEmail];

    const normalizedTag = tag ? this.normalizeUserItemTag(tag) : undefined;

    if (normalizedTag) {
      if (normalizedTag === 'dislike') {
        conditions.push('(tag = ? OR tag = ?)');
        args.push(normalizedTag, 'deleted');
      } else {
        conditions.push('tag = ?');
        args.push(normalizedTag);
      }
    }

    if (itemCodes && itemCodes.length > 0) {
      const placeholders = itemCodes.map(() => '?').join(', ');
      conditions.push(`item_code IN (${placeholders})`);
      args.push(...itemCodes);
    }

    const result = await this.client.execute({
      sql: `SELECT item_code, tag, created_at, updated_at
            FROM user_item_tags
            WHERE ${conditions.join(' AND ')}
            ORDER BY updated_at DESC, item_code ASC, tag ASC`,
      args,
    });

    return result.rows.map((row) => ({
      itemCode: row.item_code as string,
      tag: this.normalizeUserItemTag(row.tag as string),
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    }));
  }

  /**
   * 局部更新单条翻译记录。
   * 只会修改调用方显式传入的字段。
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
   * 删除指定片号的缓存记录。
   */
  async deleteTranslation(code: string): Promise<void> {
    await this.client.execute({
      sql: 'DELETE FROM translations WHERE code = ?',
      args: [code],
    });
  }

  /**
   * 检查一组片号中哪些还缺少原始响应。
   * 返回值为缺失 raw_response 的片号列表。
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
