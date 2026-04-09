/**
 * 翻译缓存记录。
 */
export interface Translation {
  code: string;
  titleZh: string;
  summaryZh: string;
  coverUrl?: string;
  rawResponse?: string; // 上游返回的原始场景 JSON，便于直接回放响应
}

/**
 * 从 GraphQL 响应中提取出的场景节点。
 */
export interface SceneNode {
  code?: string;
  title?: string;
  details?: string;
  coverUrl?: string;
}

/**
 * 应用运行配置。
 */
export interface AppConfig {
  javstashApiKey: string;
  tursoUrl: string;
  tursoAuthToken: string;
  deeplxApiUrl: string;
}

/**
 * GraphQL 请求体。
 */
export interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}

/**
 * 浏览器查询接口返回的精简结果。
 */
export interface BrowserLookupResult {
  code: string;
  title: string;
  description: string;
  translated: boolean;
}
