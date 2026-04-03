// Import shared types for use in this file
import type { Translation as TranslationType, EditForm as EditFormType } from '../../../components/shared/types';

// Re-export shared types
export type Translation = TranslationType;
export type EditForm = EditFormType;

/**
 * 排序方式
 */
export type SortBy = 'updated' | 'code';

/**
 * 管理后台视图模式
 */
export type AdminViewMode = 'table' | 'grid';

/**
 * 可选的每页数量选项
 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export type PageSize = typeof PAGE_SIZE_OPTIONS[number];

/**
 * 列表查询结果
 */
export interface ListResult {
  /** 数据列表 */
  items: Translation[];
  /** 总数量 */
  total: number;
}

/**
 * 搜索栏组件属性
 */
export interface SearchBarProps {
  /** 当前搜索关键词 */
  value: string;
  /** 关键词变更回调 */
  onChange: (value: string) => void;
  /** 执行搜索回调 */
  onSearch: () => void;
}

/**
 * 分页组件属性
 */
export interface PaginationProps {
  /** 当前页码 */
  page: number;
  /** 总页数 */
  totalPages: number;
  /** 页码变更回调 */
  onPageChange: (page: number) => void;
  /** 每页数量 */
  pageSize?: number;
  /** 每页数量变更回调 */
  onPageSizeChange?: (size: number) => void;
}

/**
 * 视图切换组件属性
 */
export interface ViewToggleProps {
  /** 当前视图模式 */
  value: AdminViewMode;
  /** 视图变更回调 */
  onChange: (value: AdminViewMode) => void;
}

/**
 * 仅在本地搜索无结果且存在有效搜索词时，准备远端搜索的初始状态
 */
export function prepareRemoteSearchFallbackState(
  searchTerm: string,
  currentItems: readonly unknown[]
): { open: boolean; keyword: string } {
  const keyword = searchTerm.trim();
  const open = keyword.length > 0 && currentItems.length === 0;

  return {
    open,
    keyword: open ? keyword : '',
  };
}
