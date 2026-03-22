/**
 * Translation cache entry
 */
export interface Translation {
  code: string;
  titleZh: string;
  summaryZh: string;
  coverUrl?: string;
  rawResponse?: string; // Original scene JSON from upstream
}

/**
 * Scene node extracted from GraphQL response
 */
export interface SceneNode {
  code?: string;
  title?: string;
  details?: string;
  coverUrl?: string;
}

/**
 * Application configuration
 */
export interface AppConfig {
  javstashApiKey: string;
  tursoUrl: string;
  tursoAuthToken: string;
  deeplxApiUrl: string;
}

/**
 * GraphQL request body
 */
export interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}