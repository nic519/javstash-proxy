/**
 * 这里存放油猴脚本和服务端浏览器查询接口共用的轻量级纯函数。
 * 这些函数不依赖 DOM 或网络，便于单测直接覆盖。
 */
import { normalizeSceneCode } from './lookup';

// 生产环境默认直接请求线上代理，正式用户脚本通常会依赖这个地址。
export const DEFAULT_PROXY_ORIGIN = 'https://javstash.vercel.app';
// 浏览器查询接口保持单独路径，和 GraphQL 代理入口解耦。
export const BROWSER_LOOKUP_PATH = '/api/browser/lookup';
// 成功查询结果默认缓存 7 天，兼顾重复访问速度和内容更新。
export const LOOKUP_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const LOOKUP_CACHE_KEY_PREFIX = 'javstash_lookup_cache_v1:';

const SCENE_CODE_PATTERN = /\b([A-Za-z0-9]{2,10}-\d{2,6})\b/;

export interface UserscriptLookupCacheEntry {
  code: string;
  title: string;
  description: string;
  cachedAt: number;
  expiresAt: number;
}

// JavBus 详情页的番号位于 URL 路径中，可直接从地址提取。
export function extractJavbusCode(url: string): string | null {
  const match = url.match(/^https?:\/\/www\.javbus\.com\/([A-Za-z0-9]{2,10}-\d{2,6})\/?$/i);
  return match ? normalizeSceneCode(match[1]) : null;
}

// 只允许 JavDB 作品详情页走详情页专用解析逻辑。
export function isJavdbDetailUrl(url: string): boolean {
  return /^https?:\/\/(?:www\.)?javdb\.com\/v\/[A-Za-z0-9]+(?:[/?#].*)?$/i.test(url);
}

// 页面结构变化时，可以退回到通用文本匹配作为容错方案。
export function extractCodeFromText(text: string): string | null {
  const match = text.match(SCENE_CODE_PATTERN);
  return match ? normalizeSceneCode(match[1]) : null;
}

// 统一构造浏览器查询接口地址，确保番号在发送前已经归一化。
export function buildLookupUrl(proxyOrigin: string, code: string): string {
  const url = new URL(BROWSER_LOOKUP_PATH, proxyOrigin);
  url.searchParams.set('code', normalizeSceneCode(code));
  return url.toString();
}

export function buildLookupCacheKey(code: string): string {
  return LOOKUP_CACHE_KEY_PREFIX + normalizeSceneCode(code);
}

export function createLookupCacheEntry(
  payload: Pick<UserscriptLookupCacheEntry, 'code' | 'title' | 'description'>,
  now = Date.now()
): UserscriptLookupCacheEntry {
  return {
    code: normalizeSceneCode(payload.code),
    title: payload.title,
    description: payload.description,
    cachedAt: now,
    expiresAt: now + LOOKUP_CACHE_TTL_MS,
  };
}

export function readValidLookupCacheEntry(
  value: unknown,
  now = Date.now()
): UserscriptLookupCacheEntry | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<UserscriptLookupCacheEntry>;
  if (
    typeof candidate.code !== 'string' ||
    typeof candidate.title !== 'string' ||
    typeof candidate.description !== 'string' ||
    typeof candidate.cachedAt !== 'number' ||
    typeof candidate.expiresAt !== 'number'
  ) {
    return null;
  }

  if (candidate.expiresAt <= now) {
    return null;
  }

  return {
    code: normalizeSceneCode(candidate.code),
    title: candidate.title,
    description: candidate.description,
    cachedAt: candidate.cachedAt,
    expiresAt: candidate.expiresAt,
  };
}
