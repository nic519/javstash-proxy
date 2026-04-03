# Admin State Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep admin list view mode, sort order, and page size stable across refreshes while driving page state from the URL and keeping page out of localStorage.

**Architecture:** Parse a canonical admin list state from `URLSearchParams` plus a storage-backed fallback for non-page preferences. Keep the page component synchronized with the URL via Next navigation helpers, and write only `pageSize`, `sortBy`, and `viewMode` to storage. Add unit tests for normalization and persistence helpers so the page logic can stay thin.

**Tech Stack:** Next.js App Router, React client components, Vitest

---

### Task 1: Add helper tests for admin list state normalization

**Files:**
- Modify: `tests/admin-view-toggle.test.ts`
- Modify: `app/admin/_components/types.ts`

- [ ] **Step 1: Write failing tests**

```ts
it('prefers URL values and only falls back to stored non-page preferences', () => {
  const state = readAdminListState({
    searchParams: new URLSearchParams('page=3&sortBy=code'),
    storage: {
      getItem: (key) =>
        key === ADMIN_PAGE_SIZE_STORAGE_KEY ? '50' : key === ADMIN_VIEW_MODE_STORAGE_KEY ? 'grid' : null,
    },
  });

  expect(state).toEqual({
    page: 3,
    pageSize: 50,
    sortBy: 'code',
    viewMode: 'grid',
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/admin-view-toggle.test.ts`
Expected: FAIL because the new helpers and keys do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export function readAdminListState(...) { ... }
export function writeAdminListPreferences(...) { ... }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/admin-view-toggle.test.ts`
Expected: PASS for the new helper coverage.

### Task 2: Synchronize admin page state with URL and storage

**Files:**
- Modify: `app/admin/page.tsx`
- Modify: `app/admin/_components/types.ts`

- [ ] **Step 1: Write the smallest page integration logic around the tested helpers**

```ts
const searchParams = useSearchParams();
const router = useRouter();

useEffect(() => {
  const nextState = readAdminListState({ searchParams, storage: window.localStorage });
  ...
}, [searchParams]);
```

- [ ] **Step 2: Update URL on state changes without storing page locally**

```ts
const nextQuery = createAdminListSearchParams({ page, pageSize, sortBy, viewMode });
router.replace(`/admin?${nextQuery.toString()}`, { scroll: false });
writeAdminListPreferences(window.localStorage, { pageSize, sortBy, viewMode });
```

- [ ] **Step 3: Clamp invalid page values after totals load**

```ts
if (totalPages > 0 && page > totalPages) {
  setPage(totalPages);
}
```

- [ ] **Step 4: Run focused tests**

Run: `npm test -- tests/admin-view-toggle.test.ts tests/admin-page-header.test.ts`
Expected: PASS
