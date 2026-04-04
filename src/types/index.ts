/**
 * JavStash Proxy 的核心类型定义。
 */

// GraphQL 请求与响应类型。
export interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
}

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
    extensions?: Record<string, any>;
  }>;
}

// 场景相关类型。
export interface Scene {
  id: string;
  title?: string;
  code?: string;
  details?: string;
  date?: string;
  studio?: { id: string; name: string };
  organized?: boolean;
}

export interface SceneInput {
  title?: string;
  details?: string;
  organized?: boolean;
}

// Stash 服务配置类型。
export interface StashConfig {
  url: string;
  apiKey?: string;
}

export interface StashBox {
  name: string;
  endpoint: string;
}

// 翻译相关类型。
export interface Translation {
  code: string;
  titleZh: string;
  summaryZh: string;
  coverUrl?: string;
  updatedAt?: string;
}

export interface TranslatedScene {
  id: string;
  title?: string;
  titleZh?: string;
  code?: string;
  details?: string;
  summaryZh?: string;
  date?: string;
  studio?: { id: string; name: string };
  organized?: boolean;
}
