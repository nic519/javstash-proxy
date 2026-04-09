import { normalizeSceneCode } from './lookup';

export const DEFAULT_PROXY_ORIGIN = 'https://javstash.vercel.app';
export const BROWSER_LOOKUP_PATH = '/api/browser/lookup';

const SCENE_CODE_PATTERN = /\b([A-Za-z0-9]{2,10}-\d{2,6})\b/;

export function extractJavbusCode(url: string): string | null {
  const match = url.match(/^https?:\/\/www\.javbus\.com\/([A-Za-z0-9]{2,10}-\d{2,6})\/?$/i);
  return match ? normalizeSceneCode(match[1]) : null;
}

export function isJavdbDetailUrl(url: string): boolean {
  return /^https?:\/\/(?:www\.)?javdb\.com\/v\/[A-Za-z0-9]+(?:[/?#].*)?$/i.test(url);
}

export function extractCodeFromText(text: string): string | null {
  const match = text.match(SCENE_CODE_PATTERN);
  return match ? normalizeSceneCode(match[1]) : null;
}

export function buildLookupUrl(proxyOrigin: string, code: string): string {
  const url = new URL(BROWSER_LOOKUP_PATH, proxyOrigin);
  url.searchParams.set('code', normalizeSceneCode(code));
  return url.toString();
}
