/**
 * Core types for the JavStash Proxy
 */

// GraphQL Request/Response types
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

// Scene types
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

// Stash types
export interface StashConfig {
  url: string;
  apiKey?: string;
}

export interface StashBox {
  name: string;
  endpoint: string;
}

// Translation types
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