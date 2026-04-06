/**
 * 翻译缓存条目
 * 复用现有的 Translation 类型定义
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

export const USER_ITEM_TAGS = ['watch_later', 'favorite', 'dislike'] as const;
export type UserItemTag = typeof USER_ITEM_TAGS[number];
export type UserItemTagFilter = 'all' | UserItemTag;

export const USER_ITEM_TAG_LABELS: Record<UserItemTag, string> = {
  watch_later: '稍后再看',
  favorite: '特别收藏',
  dislike: '不喜欢',
};

export interface UserItemTagRecord {
  itemCode: string;
  tag: UserItemTag;
  createdAt: string;
  updatedAt: string;
}

/**
 * ItemCard 组件变体
 */
export type ItemCardVariant = 'table' | 'card' | 'grid';

/**
 * ItemCard 组件属性
 */
export interface ItemCardProps {
  /** 数据条目 */
  item: Translation;
  /** 显示样式 */
  variant: ItemCardVariant;
  /** 点击回调 */
  onClick: (item: Translation) => void;
  /** 当前用户在该条目上的已选标签 */
  activeTags?: UserItemTag[];
  /** 切换标签 */
  onToggleTag?: (item: Translation, tag: UserItemTag) => void;
  /** 标签操作是否禁用 */
  tagsDisabled?: boolean;
}

/**
 * DetailModal 组件属性
 */
export interface DetailModalProps {
  /** 当前选中的条目 */
  item: Translation;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /** 更新条目回调（可选，Admin 模式） */
  onUpdate?: (item: Translation) => void;
  /** 删除条目回调（可选，Admin 模式） */
  onDelete?: (code: string) => void;
  /** 只读模式（Browse 模式为 true） */
  readOnly?: boolean;
  /** 当前条目的个人标签 */
  activeTags?: UserItemTag[];
  /** 切换当前条目的个人标签 */
  onToggleTag?: (item: Translation, tag: UserItemTag) => void;
  /** 标签操作是否禁用 */
  tagsDisabled?: boolean;
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
  /** 原始响应 */
  rawResponse: string;
}
