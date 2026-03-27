/**
 * 翻译缓存条目
 */
export interface Translation {
  /** 唯一标识码 */
  code: string;
  /** 中文标题 */
  titleZh: string;
  /** 中文简介 */
  summaryZh: string;
  /** 封面图片地址 */
  coverUrl?: string;
  /** 原始响应数据 */
  rawResponse?: string;
  /** 更新时间 */
  updatedAt?: string;
}

/**
 * 排序方式
 */
export type SortBy = 'updated' | 'code';

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
 * 翻译表格组件属性
 */
export interface TranslationTableProps {
  /** 数据列表 */
  items: Translation[];
  /** 是否加载中 */
  loading: boolean;
  /** 选中条目回调 */
  onSelect: (item: Translation) => void;
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
 * 详情弹窗组件属性
 */
export interface DetailModalProps {
  /** 当前选中的条目 */
  item: Translation;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /** 更新条目回调 */
  onUpdate: (item: Translation) => void;
  /** 删除条目回调 */
  onDelete: (code: string) => void;
}

/**
 * 编辑表单数据
 */
export interface EditForm {
  /** 中文标题 */
  titleZh: string;
  /** 中文简介 */
  summaryZh: string;
  /** 封面地址 */
  coverUrl: string;
}
