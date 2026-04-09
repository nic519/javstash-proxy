import type { AppConfig } from './types';

/**
 * 从环境变量加载运行配置。
 */
export function loadConfig(): AppConfig {
  const javstashApiKey = process.env.JAVSTASH_API_KEY;
  const tursoUrl = process.env.TURSO_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;
  const deeplxApiUrl = process.env.DEEPLX_API_URL ?? '';

  if (!javstashApiKey) {
    throw new Error('JAVSTASH_API_KEY is required');
  }
  if (!tursoUrl) {
    throw new Error('TURSO_URL is required');
  }
  if (!tursoAuthToken) {
    throw new Error('TURSO_AUTH_TOKEN is required');
  }

  return {
    javstashApiKey,
    tursoUrl,
    tursoAuthToken,
    deeplxApiUrl,
  };
}

/**
 * 浏览器查询场景只需要缓存与翻译配置，ApiKey 由请求头透传。
 */
export function loadLookupConfig() {
  const tursoUrl = process.env.TURSO_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;
  const deeplxApiUrl = process.env.DEEPLX_API_URL ?? '';

  if (!tursoUrl) {
    throw new Error('TURSO_URL is required');
  }
  if (!tursoAuthToken) {
    throw new Error('TURSO_AUTH_TOKEN is required');
  }

  return {
    tursoUrl,
    tursoAuthToken,
    deeplxApiUrl,
  };
}
