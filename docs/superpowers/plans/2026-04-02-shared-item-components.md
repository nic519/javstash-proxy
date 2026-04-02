# Shared Item Components Implementation Plan

> **For agentic workers:** REQUIRED - Use superpowers:subagent-driven-development
> **Goal:** 重构 Admin 和 Browse 页面，使用共享的 ItemCard 组件和 DetailModal 组件
> **Architecture:** 创建 components/shared/ 目录，包含共享的类型、ItemCard 和 DetailModal

---

## File Structure

```
components/
  shared/
    index.ts           # 导出所有共享组件
    types.ts           # 共享 Translation 类型（复用现有）
    ItemCard.tsx       # 通用 ItemCard 组件（table + card 样式）
    DetailModal.tsx    # 详情弹窗（从 admin 移动）

app/
  admin/
    page.tsx           # 修改：使用 ItemCard variant="table"
    _components/
      index.ts         # 更新导出
      SearchBar.tsx    # 保留
      Pagination.tsx   # 保留
      TranslationTable.tsx  # 删除（被 ItemCard 替代）

  browse/
    page.tsx           # 修改：使用 ItemCard variant="card"，添加 DetailModal
```

---

## Tasks

### Task 1: 创建共享类型定义

**Files:**
- Create: `components/shared/types.ts`
- Create: `components/shared/index.ts`

```typescript
// components/shared/types.ts

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

/**
 * ItemCard 组件变体
 */
export type ItemCardVariant = 'table' | 'card';

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
}
```

```typescript
// components/shared/index.ts

export * from './types';
export { ItemCard } from './ItemCard';
export { DetailModal } from './DetailModal';
```

- [ ] **Commit:** `refactor: create shared types for ItemCard and DetailModal`

---

### Task 2: 创建 ItemCard 组件

**Files:**
- Create: `components/shared/ItemCard.tsx`

```tsx
'use client';

import type { Translation, ItemCardVariant } from './types';

interface ItemCardProps {
  item: Translation;
  variant: ItemCardVariant;
  onClick: (item: Translation) => void;
}

/**
 * 通用 ItemCard 组件
 * 支持表格行和卡片两种显示样式
 */
export function ItemCard({ item, variant, onClick }: ItemCardProps) {
  if (variant === 'table') {
    return <TableRow item={item} onClick={onClick} />;
  }
  return <CardView item={item} onClick={onClick} />;
}

/**
 * 表格行样式
 * 紧凑的单行布局，显示 code、titleZh、summaryZh
 */
function TableRow({ item, onClick }: { item: Translation; onClick: (item: Translation) => void }) {
  return (
    <tr
      onClick={() => onClick(item)}
      className="cursor-pointer transition-colors hover:bg-[var(--bg-tertiary)]"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      {/* 代码列 */}
      <td className="px-3 py-2">
        <span className="font-mono whitespace-nowrap" style={{ color: 'var(--accent-gold)' }}>
          {item.code}
        </span>
      </td>
      {/* 标题列 */}
      <td className="px-3 py-2 max-w-xs">
        <p className="truncate" style={{ color: 'var(--text-primary)' }}>
          {item.titleZh || '-'}
        </p>
      </td>
      {/* 简介列 */}
      <td className="px-3 py-2 hidden max-w-md lg:table-cell">
        <p className="truncate" style={{ color: 'var(--text-secondary)' }}>
          {item.summaryZh || '-'}
        </p>
      </td>
    </tr>
  );
}

/**
 * 卡片样式
 * 显示封面、code、titleZh、summaryZh 等
 */
function CardView({ item, onClick }: { item: Translation; onClick: (item: Translation) => void }) {
  return (
    <div
      onClick={() => onClick(item)}
      className="glass-card group animate-fade-in flex gap-5 p-5 cursor-pointer"
      style={{ opacity: 0 }}
    >
      {/* 封面图片 */}
      {item.coverUrl && (
        <div className="image-hover w-[400px] h-[240px] rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={item.coverUrl}
            alt={item.code}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 内容区域 */}
      <div className="flex-1 min-w-0">
        {/* Code Badge */}
        <div className="flex items-center gap-3 mb-2">
          <span className="tag">{item.code}</span>
          {item.updatedAt && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {formatDate(item.updatedAt)}
            </span>
          )}
        </div>

        {/* 标题 */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-1 transition-colors duration-200 group-hover:text-[var(--accent-gold)]">
          {item.titleZh || '无标题'}
        </h3>

        {/* 简介 */}
        {item.summaryZh && (
          <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {item.summaryZh}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * 格式化日期
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN');
  } catch {
    return dateStr;
  }
}
```

- [ ] **Commit:** `feat: add shared ItemCard component with table and card variants`

---

### Task 3: 移动 DetailModal 到共享目录

**Files:**
- Move: `app/admin/_components/DetailModal.tsx` → `components/shared/DetailModal.tsx`
- Modify: `components/shared/DetailModal.tsx` (添加 readOnly 属性支持)

修改后的 DetailModal 组件需要支持 `readOnly` 属性：
- 当 `readOnly=true` 时，隐藏编辑和删除按钮
- 保持现有的编辑功能不变

**关键修改点:**

```tsx
// 在 DetailModal 组件中添加 readOnly 属性
export interface DetailModalProps {
  item: Translation;
  onClose: () => void;
  onUpdate?: (item: Translation) => void;
  onDelete?: (code: string) => void;
  readOnly?: boolean;  // 新增
}

// 在顶部栏中，根据 readOnly 条件控制按钮显示
{!readOnly && (
  <>
    <IconButton onClick={() => setEditing(!editing)} ...>
    <IconButton onClick={handleDelete} ... />
  </>
)}
```

- [ ] **Commit:** `refactor: move DetailModal to shared components with readOnly support`

---

### Task 4: 更新 Admin 页面使用共享组件

**Files:**
- Modify: `app/admin/page.tsx`
- Modify: `app/admin/_components/index.ts`
- Delete: `app/admin/_components/TranslationTable.tsx`
- Delete: `app/admin/_components/types.ts` (如果只有 Translation 相关类型)

**修改要点:**

```tsx
// app/admin/page.tsx
// 修改导入
import {
  SearchBar,
  Pagination,
  DetailModal,
  ItemCard,
  type Translation,
  type ListResult,
  type SortBy,
} from './_components';
import { Translation as SharedTranslation } from '@/components/shared';

// 修改 TranslationTable 使用为 ItemCard
// 删除：
// <TranslationTable items={items} loading={loading} onSelect={setSelected} />

// 替换为：
// （在表格容器内渲染表头和）
// <table className="w-full text-sm">
//   <thead>...</thead>
//   <tbody>
//     {items.map((item) => (
//       <ItemCard key={item.code} item={item} variant="table" onClick={setSelected} />
//     ))}
//   </tbody>
// </table>

// 夣空数据状态保持不变
```

- [ ] **Commit:** `refactor: update admin page to use shared ItemCard`

---

### Task 5: 更新 Browse 页面使用共享组件

**Files:**
- Modify: `app/browse/page.tsx`

**修改要点:**

1. 删除内联的 `Scene` 类型定义
2. 导入共享组件和类型
3. 添加 GraphQL 数据到 Translation 的转换函数
4. 使用 ItemCard variant="card" 替代现有的卡片渲染
5. 添加 selected 状态和 DetailModal
6. Browse 模式下 DetailModal 为只读模式

```tsx
// app/browse/page.tsx
'use client';

import { useState } from 'react';
import { Search, Loader2, AlertCircle, Frown } from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { SEARCH_SCENE_QUERY } from '@/src/graphql/queries';
import { ItemCard, DetailModal, type Translation } from '@/components/shared';
import type { SceneData } from '@/src/graphql/queries';

// ... 现有代码 ...

// 添加转换函数
function sceneToTranslation(scene: SceneData): Translation {
  return {
    code: scene.code,
    titleZh: scene.title || '',
    summaryZh: scene.details || '',
    coverUrl: scene.images?.[0]?.url,
    rawResponse: JSON.stringify(scene),
    updatedAt: scene.updated,
  };
}

// 添加 selected 状态
const [selected, setSelected] = useState<Translation | null>(null);

// 修改结果渲染
{results.map((scene, index) => {
  const item = sceneToTranslation(scene);
  return (
    <ItemCard
      key={scene.id}
      item={item}
      variant="card"
      onClick={setSelected}
    />
  );
})}

// 添加 DetailModal
{selected && (
  <DetailModal
    item={selected}
    onClose={() => setSelected(null)}
    readOnly
  />
)}
```

- [ ] **Commit:** `feat: update browse page to use shared ItemCard and DetailModal`

---

## Verification

完成所有任务后，运行以下命令验证：

```bash
npm run dev
npm run build
```

确认没有编译错误。

