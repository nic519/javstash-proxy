/**
 * 这些测试同时校验油猴脚本依赖的纯函数工具，以及正式发布脚本中
 * 不应残留明显的调试 UI/日志代码，避免开发期辅助逻辑泄漏到生产版本。
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  BROWSER_LOOKUP_PATH,
  DEFAULT_PROXY_ORIGIN,
  buildLookupUrl,
  extractCodeFromText,
  extractJavbusCode,
  isJavdbDetailUrl,
} from '../src/browser/userscript-helpers';

describe('tampermonkey userscript helpers', () => {
  it('extracts SSIS-828 from a javbus detail url', () => {
    expect(extractJavbusCode('https://www.javbus.com/SSIS-828')).toBe('SSIS-828');
  });

  it('returns null for unsupported javbus urls', () => {
    expect(extractJavbusCode('https://www.javbus.com')).toBeNull();
    expect(extractJavbusCode('https://www.javbus.com/page/2')).toBeNull();
  });

  it('recognizes javdb detail urls as supported pages', () => {
    expect(isJavdbDetailUrl('https://javdb.com/v/nekRYe')).toBe(true);
    expect(isJavdbDetailUrl('https://javdb.com/search?q=USBA-073')).toBe(false);
    expect(extractCodeFromText('番號: usba-073')).toBe('USBA-073');
  });

  it('falls back to text extraction for supported scene code patterns', () => {
    expect(extractCodeFromText('識別碼: ssis-828')).toBe('SSIS-828');
    expect(extractCodeFromText('no scene code here')).toBeNull();
  });

  it('builds the browser lookup request url using the fixed proxy origin', () => {
    expect(BROWSER_LOOKUP_PATH).toBe('/api/browser/lookup');
    expect(DEFAULT_PROXY_ORIGIN).toBe('https://javstash.vercel.app');
    expect(buildLookupUrl(DEFAULT_PROXY_ORIGIN, 'SSIS-828')).toBe(
      'https://javstash.vercel.app/api/browser/lookup?code=SSIS-828'
    );
  });

  it('keeps the published userscript free of debug badge and console tracing code', () => {
    const userscript = readFileSync(
      resolve(process.cwd(), 'tampermonkey/javstash-browser-lookup.user.js'),
      'utf8'
    );

    expect(userscript).not.toContain('DEBUG_BADGE_ID');
    expect(userscript).not.toContain('renderDebugBadge');
    expect(userscript).not.toContain('console.log(');
    expect(userscript).not.toContain('console.error(');
  });
});
