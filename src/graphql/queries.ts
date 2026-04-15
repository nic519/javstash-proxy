/**
 * GraphQL 查询常量。
 * 统一管理所有 GraphQL 查询，确保缓存和展示使用相同字段。
 */
import { FIND_PERFORMER_QUERY, SCENE_FRAGMENT, SEARCH_SCENE_QUERY } from './query-constants.js';

export interface PerformerImageData {
  url?: string;
}

export interface PerformerData {
  id?: string;
  name?: string;
  disambiguation?: string;
  aliases?: string[];
  gender?: string;
  urls?: Array<{ url?: string }>;
  birth_date?: string;
  death_date?: string;
  age?: number;
  ethnicity?: string;
  country?: string;
  eye_color?: string;
  hair_color?: string;
  height?: number;
  cup_size?: string;
  band_size?: number;
  waist_size?: number;
  hip_size?: number;
  breast_type?: string;
  career_start_year?: number;
  career_end_year?: number;
  tattoos?: string;
  piercings?: string;
  images?: PerformerImageData[];
}

/**
 * Scene 数据类型定义。
 * 与 `SCENE_FRAGMENT` 返回的字段保持一致。
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
    performer?: PerformerData;
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

export { FIND_PERFORMER_QUERY, SCENE_FRAGMENT, SEARCH_SCENE_QUERY };
