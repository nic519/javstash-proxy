# Admin Grid Search Fallback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a switchable `grid` view to `/admin`, keep the existing `table` view, and make `/admin` search fall back to Javstash in a modal only when the local admin search returns zero rows.

**Architecture:** Extend the shared `ItemCard` component with a `grid` variant for admin-only body rendering, then extract the existing `/browse` remote result list into a reusable component that can render both in `/browse` and inside a new admin modal. Keep local admin pagination and sorting untouched; remote fallback stays isolated in modal state.

**Tech Stack:** Next.js App Router, React client components, TypeScript, shared UI components, existing GraphQL `/api/graphql` endpoint, Vitest, `tsc --noEmit`

---

## File Structure

- Modify: `components/shared/types.ts`
  Add the `grid` variant to shared item-card types.
- Modify: `components/shared/ItemCard.tsx`
  Implement the new `grid` rendering branch while keeping `table` and `card` behavior stable.
- Create: `components/shared/sceneToTranslation.ts`
  Move the `/browse` scene-to-translation mapping into a reusable helper.
- Create: `components/shared/RemoteSceneResults.tsx`
  Extract the existing `/browse` remote search result rendering, empty state, error state, and loading state into a reusable component.
- Create: `app/admin/_components/ViewToggle.tsx`
  Add an explicit toggle for `table` and `grid`.
- Create: `app/admin/_components/AdminRemoteSearchModal.tsx`
  Provide a modal shell that hosts the extracted remote results component.
- Modify: `app/admin/_components/types.ts`
  Add `viewMode` types used by admin-specific controls.
- Modify: `app/admin/_components/index.ts`
  Export the new admin-only components and types.
- Modify: `app/admin/page.tsx`
  Add `grid` view switching and local-first / remote-fallback search flow.
- Modify: `app/browse/page.tsx`
  Replace inline scene mapping and inline result rendering with the shared helper and reusable results component.
- Test: `tests/graphql-queries.test.ts`
  Add focused tests around the shared search query contract if helper extraction changes imports or query usage.
- Create: `tests/scene-to-translation.test.ts`
  Add unit coverage for the new scene mapping helper.

## Task 1: Extract Shared Remote Search Rendering Primitives

**Files:**
- Create: `components/shared/sceneToTranslation.ts`
- Create: `components/shared/RemoteSceneResults.tsx`
- Modify: `components/shared/index.ts`
- Modify: `app/browse/page.tsx`
- Test: `tests/scene-to-translation.test.ts`

- [ ] **Step 1: Write the failing helper test**

```ts
import { describe, expect, it } from 'vitest';
import { sceneToTranslation } from '@/components/shared/sceneToTranslation';
import type { SceneData } from '@/src/graphql/queries';

describe('sceneToTranslation', () => {
  it('maps GraphQL scene fields into shared Translation shape', () => {
    const scene: SceneData = {
      id: 'scene-1',
      code: 'ABP-123',
      title: '中文标题',
      details: '中文简介',
      updated: '2026-04-03T08:00:00.000Z',
      images: [{ url: 'https://img.example/cover.jpg' }],
    };

    expect(sceneToTranslation(scene)).toEqual({
      code: 'ABP-123',
      titleZh: '中文标题',
      summaryZh: '中文简介',
      coverUrl: 'https://img.example/cover.jpg',
      rawResponse: JSON.stringify(scene),
      updatedAt: '2026-04-03T08:00:00.000Z',
    });
  });

  it('falls back to empty strings when optional fields are missing', () => {
    const scene: SceneData = {
      id: 'scene-2',
      code: 'IPX-001',
    };

    expect(sceneToTranslation(scene)).toMatchObject({
      code: 'IPX-001',
      titleZh: '',
      summaryZh: '',
      coverUrl: undefined,
      updatedAt: undefined,
    });
  });
});
```

- [ ] **Step 2: Run the new test to verify it fails**

Run: `npm test -- --run tests/scene-to-translation.test.ts`

Expected: FAIL with module-not-found or missing export for `sceneToTranslation`

- [ ] **Step 3: Add the shared mapping helper**

```ts
import type { SceneData } from '@/src/graphql/queries';
import type { Translation } from './types';

export function sceneToTranslation(scene: SceneData): Translation {
  return {
    code: scene.code,
    titleZh: scene.title || '',
    summaryZh: scene.details || '',
    coverUrl: scene.images?.[0]?.url,
    rawResponse: JSON.stringify(scene),
    updatedAt: scene.updated,
  };
}
```

- [ ] **Step 4: Extract reusable remote result rendering**

```tsx
'use client';

import { AlertCircle, Frown, Loader2, Search } from 'lucide-react';
import type { SceneData } from '@/src/graphql/queries';
import { ItemCard } from './ItemCard';
import { sceneToTranslation } from './sceneToTranslation';
import type { Translation } from './types';

interface RemoteSceneResultsProps {
  results: SceneData[];
  loading: boolean;
  error: string;
  keyword: string;
  emptyTitle?: string;
  emptyHint?: string;
  onItemClick: (item: Translation) => void;
}

export function RemoteSceneResults({
  results,
  loading,
  error,
  keyword,
  emptyTitle = '未找到相关结果',
  emptyHint = '请尝试其他关键词或检查输入',
  onItemClick,
}: RemoteSceneResultsProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}>
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (results.length === 0 && keyword) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
          <Frown className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
        </div>
        <p className="text-xl font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{emptyTitle}</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{emptyHint}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.05))', border: '1px solid rgba(212,175,55,0.2)' }}>
          <Search className="w-10 h-10" style={{ color: 'var(--accent-gold)' }} />
        </div>
        <p className="text-xl font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>开始搜索</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>输入番号、演员名或关键词来搜索内容</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((scene, index) => (
        <div key={scene.id} style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}>
          <ItemCard item={sceneToTranslation(scene)} variant="card" onClick={onItemClick} />
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Switch `/browse` to the shared helper and shared result renderer**

```tsx
import { DetailModal, RemoteSceneResults, sceneToTranslation, type Translation } from '@/components/shared';

// inside component
const handleItemClick = (item: Translation) => {
  setSelected(item);
};

// replace old result section with:
<RemoteSceneResults
  results={results}
  loading={loading}
  error={error}
  keyword={keyword}
  onItemClick={handleItemClick}
/>
```

- [ ] **Step 6: Export the new shared modules**

```ts
export * from './types';
export { ItemCard } from './ItemCard';
export { DetailModal } from './DetailModal';
export { RemoteSceneResults } from './RemoteSceneResults';
export { sceneToTranslation } from './sceneToTranslation';
```

- [ ] **Step 7: Run the helper test to verify it passes**

Run: `npm test -- --run tests/scene-to-translation.test.ts`

Expected: PASS with 2 tests passed

- [ ] **Step 8: Run browse-related verification**

Run: `npm run typecheck`

Expected: PASS without `sceneToTranslation` import errors in `/app/browse/page.tsx`

- [ ] **Step 9: Commit**

```bash
git add components/shared/index.ts components/shared/sceneToTranslation.ts components/shared/RemoteSceneResults.tsx app/browse/page.tsx tests/scene-to-translation.test.ts
git commit -m "refactor: extract remote scene result components"
```

## Task 2: Add Grid Support to Shared Item Rendering

**Files:**
- Modify: `components/shared/types.ts`
- Modify: `components/shared/ItemCard.tsx`
- Test: `tests/scene-to-translation.test.ts`

- [ ] **Step 1: Write the failing type change**

```ts
export type ItemCardVariant = 'table' | 'card' | 'grid';
```

Expected downstream failure before implementation: `variant="grid"` is not accepted in `/admin`

- [ ] **Step 2: Add the `grid` branch in the shared card component**

```tsx
export function ItemCard({ item, variant, onClick }: ItemCardProps) {
  if (variant === 'table') {
    return <TableRow item={item} onClick={onClick} />;
  }

  if (variant === 'grid') {
    return <GridCard item={item} onClick={onClick} />;
  }

  return <CardView item={item} onClick={onClick} />;
}

function GridCard({ item, onClick }: { item: Translation; onClick: (item: Translation) => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className="glass-card group overflow-hidden rounded-2xl text-left cursor-pointer"
    >
      <div className="aspect-[3/4] w-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
        {item.coverUrl ? (
          <img src={item.coverUrl} alt={item.code} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: 'var(--text-muted)' }}>
            No Cover
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs mb-1 font-mono" style={{ color: 'var(--accent-gold)' }}>{item.code}</p>
        <h3 className="text-sm font-medium line-clamp-2" style={{ color: 'var(--text-primary)' }}>
          {item.titleZh || item.code}
        </h3>
      </div>
    </button>
  );
}
```

- [ ] **Step 3: Run type verification**

Run: `npm run typecheck`

Expected: PASS with `ItemCardVariant` accepting the new `grid` value

- [ ] **Step 4: Commit**

```bash
git add components/shared/types.ts components/shared/ItemCard.tsx
git commit -m "feat: add grid variant to shared item card"
```

## Task 3: Add Admin View Toggle and Local-First Search Fallback Flow

**Files:**
- Create: `app/admin/_components/ViewToggle.tsx`
- Modify: `app/admin/_components/types.ts`
- Modify: `app/admin/_components/index.ts`
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Add admin-only view mode types**

```ts
export type AdminViewMode = 'table' | 'grid';

export interface ViewToggleProps {
  value: AdminViewMode;
  onChange: (value: AdminViewMode) => void;
}
```

- [ ] **Step 2: Implement the compact view toggle**

```tsx
'use client';

import { LayoutGrid, Rows3 } from 'lucide-react';
import type { ViewToggleProps } from './types';

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'var(--bg-tertiary)' }}>
      <button
        type="button"
        onClick={() => onChange('table')}
        className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
        style={{
          background: value === 'table' ? 'rgba(212,175,55,0.16)' : 'transparent',
          color: value === 'table' ? 'var(--accent-gold)' : 'var(--text-muted)',
        }}
      >
        <Rows3 className="w-4 h-4" />
        <span>列表</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('grid')}
        className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
        style={{
          background: value === 'grid' ? 'rgba(212,175,55,0.16)' : 'transparent',
          color: value === 'grid' ? 'var(--accent-gold)' : 'var(--text-muted)',
        }}
      >
        <LayoutGrid className="w-4 h-4" />
        <span>网格</span>
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Add the new admin page state and remote fallback search**

```tsx
const [viewMode, setViewMode] = useState<AdminViewMode>('table');
const [remoteResults, setRemoteResults] = useState<SceneData[]>([]);
const [remoteLoading, setRemoteLoading] = useState(false);
const [remoteError, setRemoteError] = useState('');
const [remoteOpen, setRemoteOpen] = useState(false);

const searchRemote = useCallback(async (keyword: string) => {
  setRemoteLoading(true);
  setRemoteError('');
  setRemoteOpen(true);

  try {
    const res = await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: SEARCH_SCENE_QUERY,
        variables: { term: keyword },
      }),
    });

    const data = await res.json();
    if (data.errors) {
      setRemoteError(data.errors[0]?.message || '查询失败');
      setRemoteResults([]);
      return;
    }

    setRemoteResults(data.data?.searchScene || []);
  } catch {
    setRemoteError('请求失败，请重试');
    setRemoteResults([]);
  } finally {
    setRemoteLoading(false);
  }
}, []);

const fetchData = useCallback(async () => {
  setLoading(true);
  try {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortBy,
    });
    if (search) params.set('search', search);

    const res = await fetch(`/api/admin/translations?${params}`);
    if (!res.ok) {
      throw new Error('获取数据失败');
    }

    const data: ListResult = await res.json();
    setItems(data.items);
    setTotal(data.total);

    if (search && data.items.length === 0) {
      void searchRemote(search);
    } else {
      setRemoteOpen(false);
      setRemoteResults([]);
      setRemoteError('');
    }
  } catch {
    showMessage('获取数据失败');
  } finally {
    setLoading(false);
  }
}, [page, pageSize, search, sortBy, searchRemote]);
```

- [ ] **Step 4: Render `table` and `grid` as peer body views**

```tsx
{loading ? (
  <LoadingState />
) : items.length === 0 ? (
  <EmptyState />
) : viewMode === 'table' ? (
  <table className="w-full text-sm">
    <thead>{/* existing header */}</thead>
    <tbody>
      {items.map((item) => (
        <ItemCard key={item.code} item={item} variant="table" onClick={setSelected} />
      ))}
    </tbody>
  </table>
) : (
  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 p-4">
    {items.map((item) => (
      <ItemCard key={item.code} item={item} variant="grid" onClick={setSelected} />
    ))}
  </div>
)}
```

- [ ] **Step 5: Add the new toggle into the admin toolbar**

```tsx
<div className="flex items-center gap-3 flex-wrap justify-end">
  <ViewToggle value={viewMode} onChange={setViewMode} />
  <Select value={sortBy} onValueChange={(v) => { setSortBy(v as SortBy); setPage(1); }}>
    {/* existing sort select */}
  </Select>
  <SearchBar value={searchInput} onChange={setSearchInput} onSearch={handleSearch} />
</div>
```

- [ ] **Step 6: Export and wire the new admin types/components**

```ts
export { ViewToggle } from './ViewToggle';
export type { SortBy, PageSize, AdminViewMode, ViewToggleProps } from './types';
```

- [ ] **Step 7: Run verification**

Run: `npm run typecheck`

Expected: PASS with `/app/admin/page.tsx` compiling for both `table` and `grid` rendering paths

- [ ] **Step 8: Commit**

```bash
git add app/admin/_components/ViewToggle.tsx app/admin/_components/types.ts app/admin/_components/index.ts app/admin/page.tsx
git commit -m "feat: add admin grid view and fallback search state"
```

## Task 4: Add the Remote Search Modal to Admin and Reuse Browse Result Behavior

**Files:**
- Create: `app/admin/_components/AdminRemoteSearchModal.tsx`
- Modify: `app/admin/_components/index.ts`
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Implement the admin remote modal shell**

```tsx
'use client';

import { X } from 'lucide-react';
import { RemoteSceneResults, type Translation } from '@/components/shared';
import type { SceneData } from '@/src/graphql/queries';

interface AdminRemoteSearchModalProps {
  open: boolean;
  keyword: string;
  results: SceneData[];
  loading: boolean;
  error: string;
  onClose: () => void;
  onSelect: (item: Translation) => void;
}

export function AdminRemoteSearchModal({
  open,
  keyword,
  results,
  loading,
  error,
  onClose,
  onSelect,
}: AdminRemoteSearchModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-x-6 top-8 bottom-8 rounded-2xl overflow-hidden" style={{ background: 'rgba(15, 15, 20, 0.92)', border: '1px solid rgba(212,175,55,0.12)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <h2 className="text-lg font-medium" style={{ color: 'var(--accent-gold)' }}>Javstash 搜索结果</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>本地未命中“{keyword}”，以下为远端结果</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="h-full overflow-y-auto p-6">
          <RemoteSceneResults
            results={results}
            loading={loading}
            error={error}
            keyword={keyword}
            onItemClick={onSelect}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Mount the modal in `/admin` and reuse the existing detail flow**

```tsx
<AdminRemoteSearchModal
  open={remoteOpen}
  keyword={search}
  results={remoteResults}
  loading={remoteLoading}
  error={remoteError}
  onClose={() => setRemoteOpen(false)}
  onSelect={(item) => setSelected(item)}
/>

{selected && (
  <DetailModal
    item={selected}
    onClose={() => setSelected(null)}
    onUpdate={remoteOpen ? undefined : handleUpdate}
    onDelete={remoteOpen ? undefined : handleDelete}
    readOnly={remoteOpen}
  />
)}
```

- [ ] **Step 3: Run end-to-end static verification**

Run: `npm run typecheck && npm test`

Expected: PASS with the new modal component compiling and the existing GraphQL query tests still green

- [ ] **Step 4: Commit**

```bash
git add app/admin/_components/AdminRemoteSearchModal.tsx app/admin/_components/index.ts app/admin/page.tsx
git commit -m "feat: show remote admin search results in modal"
```

## Self-Review

### Spec coverage

- `table` / `grid` only in admin body: covered by Task 2 and Task 3
- grid shows image + title only: covered by Task 2
- local search first, remote only on zero rows: covered by Task 3
- remote results not mixed into admin body: covered by Task 4 modal shell
- reuse browse result view and click logic: covered by Task 1 and Task 4

### Placeholder scan

No `TODO`, `TBD`, or “similar to previous task” placeholders remain. Each code-affecting step includes the concrete path, code shape, and verification command.

### Type consistency

- Shared `ItemCardVariant` expands to include `grid`
- Admin-only `AdminViewMode` remains limited to `table | grid`
- Remote modal passes `Translation` items into the existing `DetailModal`
- `SceneData` remains the remote search payload type throughout
