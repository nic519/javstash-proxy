# User Item Tags Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-user preset item tags bound to authenticated email, viewable and manageable inside the existing admin route without requiring admin permissions.

**Architecture:** Introduce a `user_item_tags` table in the Turso cache layer, expose an authenticated `/api/admin/item-tags` route that works for any logged-in user with an email, and thread tag state into the admin controls, item cards, and detail modal. Keep cache-management permissions unchanged by treating tag operations as user-scoped actions separate from translation editing.

**Tech Stack:** Next.js App Router, Clerk auth, Turso/libsql, React 19, Vitest

---

### Task 1: Define tag types and failing UI expectations

**Files:**
- Modify: `components/shared/types.ts`
- Modify: `app/admin/_components/types.ts`
- Test: `tests/detail-modal.test.ts`
- Test: `tests/admin-page-controls.test.ts`

- [ ] **Step 1: Write failing tests for control-panel tag filter copy**

```ts
it('renders personal tag filter controls alongside the existing admin tools', () => {
  const markup = renderToStaticMarkup(
    createElement(AdminPageControls, {
      sortBy: 'updated',
      randomMode: false,
      viewMode: 'table',
      searchInput: '',
      tagFilter: 'all',
      onTagFilterChange: () => {},
      onSortChange: () => {},
      onRandomModeChange: () => {},
      onRandomRefresh: () => {},
      onViewModeChange: () => {},
      onSearchInputChange: () => {},
      onSearch: () => {},
    })
  );

  expect(markup).toContain('我的标签');
  expect(markup).toContain('稍后再看');
  expect(markup).toContain('特别收藏');
  expect(markup).toContain('已删除');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/admin-page-controls.test.ts`
Expected: FAIL because `tagFilter` props and tag labels are not implemented yet.

- [ ] **Step 3: Write failing tests for detail tag actions**

```ts
it('renders preset tag toggles in detail mode', () => {
  const markup = renderToStaticMarkup(
    createElement(DetailView, {
      item: {
        code: 'ABP-123',
        titleZh: '标题',
        summaryZh: '简介',
      },
      form: {
        titleZh: '标题',
        summaryZh: '简介',
        coverUrl: '',
        rawResponse: '',
      },
      onClose: () => {},
      onCopyCode: () => {},
      copied: false,
      rawData: null,
      activeTags: ['watch_later'],
      onToggleTag: () => {},
      tagsDisabled: false,
    })
  );

  expect(markup).toContain('稍后再看');
  expect(markup).toContain('特别收藏');
  expect(markup).toContain('已删除');
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- tests/detail-modal.test.ts`
Expected: FAIL because `DetailView` does not yet accept tag props or render tag controls.

- [ ] **Step 5: Add minimal shared tag type definitions**

```ts
export const USER_ITEM_TAGS = ['watch_later', 'favorite', 'deleted'] as const;
export type UserItemTag = typeof USER_ITEM_TAGS[number];
export type UserItemTagFilter = 'all' | UserItemTag;

export interface UserItemTagRecord {
  itemCode: string;
  tag: UserItemTag;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 6: Run both tests and keep them failing only on missing UI**

Run: `npm test -- tests/admin-page-controls.test.ts tests/detail-modal.test.ts`
Expected: FAIL with missing rendered tag UI, but no type-definition import errors.

- [ ] **Step 7: Commit**

```bash
git add components/shared/types.ts app/admin/_components/types.ts tests/admin-page-controls.test.ts tests/detail-modal.test.ts
git commit -m "test: define user item tag contracts"
```

### Task 2: Add failing storage tests for per-user item tags

**Files:**
- Test: `tests/cache.test.ts`
- Modify: `src/cache/turso.ts`

- [ ] **Step 1: Write failing tests for tag upsert, list, and delete**

```ts
it('stores multiple preset tags for the same user and item', async () => {
  const cache = createCache();

  await cache.upsertUserItemTag({ userEmail: 'user@example.com', itemCode: 'ABP-123', tag: 'watch_later' });
  await cache.upsertUserItemTag({ userEmail: 'user@example.com', itemCode: 'ABP-123', tag: 'favorite' });

  await expect(
    cache.listUserItemTags({ userEmail: 'user@example.com', itemCodes: ['ABP-123'] })
  ).resolves.toEqual([
    expect.objectContaining({ itemCode: 'ABP-123', tag: 'favorite' }),
    expect.objectContaining({ itemCode: 'ABP-123', tag: 'watch_later' }),
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/cache.test.ts`
Expected: FAIL because tag storage methods do not exist.

- [ ] **Step 3: Implement minimal cache-layer schema bootstrap and methods**

```ts
private async ensureUserItemTagsTable(): Promise<void> {
  await this.client.execute(`
    CREATE TABLE IF NOT EXISTS user_item_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT NOT NULL,
      item_code TEXT NOT NULL,
      tag TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(user_email, item_code, tag)
    )
  `);
}
```

- [ ] **Step 4: Re-run cache tests**

Run: `npm test -- tests/cache.test.ts`
Expected: PASS for new tag-storage coverage and existing cache tests remain green.

- [ ] **Step 5: Commit**

```bash
git add src/cache/turso.ts tests/cache.test.ts
git commit -m "feat: add per-user item tag storage"
```

### Task 3: Add failing API tests for authenticated user tag operations

**Files:**
- Create: `app/api/admin/item-tags/route.ts`
- Test: `tests/admin-item-tags-route.test.ts`

- [ ] **Step 1: Write failing route tests for auth and validation**

```ts
it('rejects unauthenticated requests', async () => {
  mockGetAppAuthState.mockResolvedValue({
    authenticated: false,
    userId: null,
    email: null,
    isAdmin: false,
  });

  const response = await GET(new NextRequest('http://localhost/api/admin/item-tags'));

  expect(response.status).toBe(401);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/admin-item-tags-route.test.ts`
Expected: FAIL because the route file does not exist.

- [ ] **Step 3: Implement minimal authenticated route handlers**

```ts
if (!authState.authenticated || !authState.email) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

- [ ] **Step 4: Re-run route tests**

Run: `npm test -- tests/admin-item-tags-route.test.ts`
Expected: PASS for GET/PUT/DELETE auth, validation, and cache method dispatch.

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/item-tags/route.ts tests/admin-item-tags-route.test.ts
git commit -m "feat: add authenticated user item tag api"
```

### Task 4: Render and toggle tags in admin UI

**Files:**
- Modify: `app/admin/page.tsx`
- Modify: `app/admin/_components/AdminPageControls.tsx`
- Modify: `components/shared/ItemCard.tsx`
- Modify: `components/shared/DetailModal.tsx`
- Modify: `components/shared/detail-modal/DetailView.tsx`
- Modify: `components/shared/types.ts`

- [ ] **Step 1: Write failing tests for item-card tag rendering or event isolation where practical**

```ts
it('does not open the item when a tag toggle is clicked', async () => {
  // render ItemCard, click tag button, assert onClick not called
});
```

- [ ] **Step 2: Run targeted UI tests to verify failures**

Run: `npm test -- tests/detail-modal.test.ts tests/admin-page-controls.test.ts`
Expected: FAIL because tag controls are not wired through the shared components.

- [ ] **Step 3: Implement admin page tag state and fetchers**

```ts
const [tagFilter, setTagFilter] = useState<UserItemTagFilter>('all');
const [itemTagsByCode, setItemTagsByCode] = useState<Record<string, UserItemTag[]>>({});
```

- [ ] **Step 4: Implement card/detail toggle callbacks against `/api/admin/item-tags`**

```ts
const toggleTag = async (code: string, tag: UserItemTag, active: boolean) => {
  const method = active ? 'DELETE' : 'PUT';
  await fetch('/api/admin/item-tags', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, tag }),
  });
};
```

- [ ] **Step 5: Re-run UI tests**

Run: `npm test -- tests/detail-modal.test.ts tests/admin-page-controls.test.ts`
Expected: PASS with tag controls present and wired props compiling.

- [ ] **Step 6: Commit**

```bash
git add app/admin/page.tsx app/admin/_components/AdminPageControls.tsx components/shared/ItemCard.tsx components/shared/DetailModal.tsx components/shared/detail-modal/DetailView.tsx components/shared/types.ts tests/detail-modal.test.ts tests/admin-page-controls.test.ts
git commit -m "feat: add user item tag controls to admin ui"
```

### Task 5: Verify end-to-end behavior

**Files:**
- Test: `tests/cache.test.ts`
- Test: `tests/admin-item-tags-route.test.ts`
- Test: `tests/detail-modal.test.ts`
- Test: `tests/admin-page-controls.test.ts`

- [ ] **Step 1: Run focused test suite**

Run: `npm test -- tests/cache.test.ts tests/admin-item-tags-route.test.ts tests/detail-modal.test.ts tests/admin-page-controls.test.ts`
Expected: PASS

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit verification-safe final state**

```bash
git add .
git commit -m "feat: support per-user item tags"
```
