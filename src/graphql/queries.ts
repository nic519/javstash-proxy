/**
 * GraphQL 查询常量
 * 统一管理所有 GraphQL 查询，确保缓存和展示使用相同的字段
 */
import { SCENE_FRAGMENT, SEARCH_SCENE_QUERY } from './query-constants.js';

/**
 * Scene 数据类型定义
 * 与 SCENE_FRAGMENT 返回的字段保持一致
 */
export interface SceneData {
  id: string;
  code: string;
  title?: string;
  details?: string;
  date?: string;
  duration?: number;
  director?: string;
  created?: string;
  updated?: string;
  images?: Array<{ url?: string }>;
  urls?: Array<{ url?: string }>;
  performers?: Array<{
    performer?: {
      id?: string;
      name?: string;
      gender?: string;
      urls?: Array<{ url?: string }>;
      images?: Array<{ url?: string }>;
    };
  }>;
  tags?: Array<{
    id?: string;
    name?: string;
  }>;
  studio?: {
    id?: string;
    name?: string;
    urls?: Array<{ url?: string }>;
  };
}

export { SCENE_FRAGMENT, SEARCH_SCENE_QUERY };
