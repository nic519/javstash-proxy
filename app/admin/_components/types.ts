// Import shared types for use in this file
import type { Translation as TranslationType, EditForm as EditFormType } from '../../../components/shared/types';

// Re-export shared types
export type Translation = TranslationType;
export type EditForm = EditFormType;

/**
 * 排序方式
 */
export type SortBy = 'updated' | 'code';
export const ADMIN_SORT_BY_STORAGE_KEY = 'admin:sort-by';

/**
 * 管理后台视图模式
 */
export type AdminViewMode = 'table' | 'grid';
export const ADMIN_VIEW_MODE_STORAGE_KEY = 'admin:view-mode';
export const ADMIN_PAGE_SIZE_STORAGE_KEY = 'admin:page-size';

/**
 * 可选的每页数量选项
 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export type PageSize = typeof PAGE_SIZE_OPTIONS[number];

export interface AdminListState {
  page: number;
  pageSize: PageSize;
  sortBy: SortBy;
  viewMode: AdminViewMode;
}

export interface AdminListPreferences {
  pageSize: PageSize;
  sortBy: SortBy;
  viewMode: AdminViewMode;
}

export interface AdminSearchOverlayState {
  open: boolean;
  keyword: string;
}

interface AdminListSearchParamsLike {
  get(name: string): string | null;
  has(name: string): boolean;
}

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
  /** 是否禁用 */
  disabled?: boolean;
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
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 视图切换组件属性
 */
export interface ViewToggleProps {
  /** 当前视图模式 */
  value: AdminViewMode;
  /** 视图变更回调 */
  onChange: (value: AdminViewMode) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 管理页头组件属性
 */
export interface AdminPageHeaderProps {
  /** 数据总量 */
  total: number;
}

export interface AdminPageControlsProps {
  /** 当前排序方式 */
  sortBy: SortBy;
  /** 是否处于随机模式 */
  randomMode: boolean;
  /** 当前视图模式 */
  viewMode: AdminViewMode;
  /** 当前搜索词 */
  searchInput: string;
  /** 是否禁止后台交互 */
  backgroundInteractionDisabled?: boolean;
  /** 排序变更回调 */
  onSortChange: (value: SortBy) => void;
  /** 随机模式变更回调 */
  onRandomModeChange: (value: boolean) => void;
  /** 再随机一次回调 */
  onRandomRefresh: () => void;
  /** 视图模式变更回调 */
  onViewModeChange: (value: AdminViewMode) => void;
  /** 搜索词变更回调 */
  onSearchInputChange: (value: string) => void;
  /** 搜索回调 */
  onSearch: () => void;
}

export function normalizeAdminViewMode(value: string | null | undefined): AdminViewMode {
  return value === 'grid' ? 'grid' : 'table';
}

export function normalizeAdminSortBy(value: string | null | undefined): SortBy {
  return value === 'code' ? 'code' : 'updated';
}

export function normalizeAdminPageSize(value: string | null | undefined): PageSize {
  const parsed = Number(value);
  return PAGE_SIZE_OPTIONS.includes(parsed as PageSize) ? (parsed as PageSize) : 20;
}

export function normalizeAdminPage(value: string | null | undefined): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : 1;
}

export function readAdminViewMode(
  storage: Pick<Storage, 'getItem'> | null | undefined
): AdminViewMode {
  if (!storage) {
    return 'table';
  }
  return normalizeAdminViewMode(storage.getItem(ADMIN_VIEW_MODE_STORAGE_KEY));
}

export function writeAdminViewMode(
  storage: Pick<Storage, 'setItem'> | null | undefined,
  viewMode: AdminViewMode
) {
  storage?.setItem(ADMIN_VIEW_MODE_STORAGE_KEY, viewMode);
}

export function readAdminListState({
  searchParams,
  storage,
}: {
  searchParams: AdminListSearchParamsLike;
  storage: Pick<Storage, 'getItem'> | null | undefined;
}): AdminListState {
  const page = normalizeAdminPage(searchParams.get('page'));
  const pageSize = searchParams.has('pageSize')
    ? normalizeAdminPageSize(searchParams.get('pageSize'))
    : normalizeAdminPageSize(storage?.getItem(ADMIN_PAGE_SIZE_STORAGE_KEY));
  const sortBy = searchParams.has('sortBy')
    ? normalizeAdminSortBy(searchParams.get('sortBy'))
    : normalizeAdminSortBy(storage?.getItem(ADMIN_SORT_BY_STORAGE_KEY));
  const viewMode = searchParams.has('viewMode')
    ? normalizeAdminViewMode(searchParams.get('viewMode'))
    : readAdminViewMode(storage);

  return {
    page,
    pageSize,
    sortBy,
    viewMode,
  };
}

export function writeAdminListPreferences(
  storage: Pick<Storage, 'setItem'> | null | undefined,
  preferences: AdminListPreferences
) {
  storage?.setItem(ADMIN_PAGE_SIZE_STORAGE_KEY, String(preferences.pageSize));
  storage?.setItem(ADMIN_SORT_BY_STORAGE_KEY, preferences.sortBy);
  writeAdminViewMode(storage, preferences.viewMode);
}

export function createAdminListSearchParams(state: AdminListState): URLSearchParams {
  return new URLSearchParams({
    page: String(normalizeAdminPage(String(state.page))),
    pageSize: String(normalizeAdminPageSize(String(state.pageSize))),
    sortBy: normalizeAdminSortBy(state.sortBy),
    viewMode: normalizeAdminViewMode(state.viewMode),
  });
}

export function readAdminSearchOverlayState(
  searchParams: Pick<URLSearchParams, 'get'>
): AdminSearchOverlayState {
  const open = searchParams.get('overlay') === 'search';
  const keyword = open ? searchParams.get('q')?.trim() || '' : '';

  return { open, keyword };
}

export function applyAdminSearchOverlayState(
  searchParams: URLSearchParams,
  overlay: AdminSearchOverlayState
): URLSearchParams {
  const nextParams = new URLSearchParams(searchParams.toString());

  if (!overlay.open) {
    nextParams.delete('overlay');
    nextParams.delete('q');
    return nextParams;
  }

  nextParams.set('overlay', 'search');

  if (overlay.keyword) {
    nextParams.set('q', overlay.keyword.trim());
  } else {
    nextParams.delete('q');
  }

  return nextParams;
}

export function shouldDisableAdminBackgroundInteractions(remoteOpen: boolean): boolean {
  return remoteOpen;
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
