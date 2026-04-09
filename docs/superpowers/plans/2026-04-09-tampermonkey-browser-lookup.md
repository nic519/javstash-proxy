# Tampermonkey Browser Lookup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a browser-facing lookup API plus a Tampermonkey userscript that detects `javbus` scene codes, injects a lookup button, and shows translated title and summary in an on-page panel.

**Architecture:** Keep the browser contract thin by adding a dedicated `/api/browser/lookup` route that accepts a normalized code and a user-provided `X-Javstash-Api-Key`, then reuses the existing JavStash forwarding, cache, and translation pipeline. Ship the userscript as a standalone `.user.js` file with a fixed proxy base URL, Tampermonkey menu-based `ApiKey` storage, one-site detection for `javbus`, and a small injected panel UI.

**Tech Stack:** Next.js App Router, Edge runtime route handlers, existing JavStash/Turso/DeepLX services, Vitest, standalone Tampermonkey userscript

---

### Task 1: Add failing tests for browser lookup request handling

**Files:**
- Create: `tests/browser-lookup-route.test.ts`
- Modify: `app/api/browser/lookup/route.ts`
- Modify: `src/config.ts`
- Modify: `src/types.ts`

- [ ] **Step 1: Write the failing route tests**

```ts
it('returns 401 when the browser lookup api key header is missing', async () => {
  const { GET } = await import('../app/api/browser/lookup/route');
  const response = await GET(
    new NextRequest('http://localhost/api/browser/lookup?code=SSIS-828')
  );

  expect(response.status).toBe(401);
  await expect(response.json()).resolves.toEqual({
    ok: false,
    error: 'MISSING_API_KEY',
    message: 'Missing JavStash ApiKey',
  });
});

it('returns translated lookup data for an exact scene code match', async () => {
  lookupSceneByCodeMock.mockResolvedValue({
    code: 'SSIS-828',
    title: '中文标题',
    description: '中文简介',
    translated: true,
  });

  const { GET } = await import('../app/api/browser/lookup/route');
  const response = await GET(
    new NextRequest('http://localhost/api/browser/lookup?code=ssis-828', {
      headers: { 'x-javstash-api-key': 'user-key' },
    })
  );

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({
    ok: true,
    code: 'SSIS-828',
    title: '中文标题',
    description: '中文简介',
    translated: true,
    source: 'javstash-proxy',
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- tests/browser-lookup-route.test.ts`
Expected: FAIL because the browser lookup route and helper do not exist yet.

- [ ] **Step 3: Add the minimal route/config/types implementation**

```ts
export interface BrowserLookupResult {
  code: string;
  title: string;
  description: string;
  translated: boolean;
}
```

```ts
const apiKey = request.headers.get('x-javstash-api-key')?.trim();
if (!apiKey) {
  return NextResponse.json(
    { ok: false, error: 'MISSING_API_KEY', message: 'Missing JavStash ApiKey' },
    { status: 401 }
  );
}
```

- [ ] **Step 4: Re-run the route test**

Run: `bun run test -- tests/browser-lookup-route.test.ts`
Expected: PASS for header validation and success payload shape.

- [ ] **Step 5: Commit**

```bash
git add app/api/browser/lookup/route.ts src/config.ts src/types.ts tests/browser-lookup-route.test.ts
git commit -m "feat: add browser lookup route contract"
```

### Task 2: Add failing tests for the scene lookup service

**Files:**
- Create: `src/browser/lookup.ts`
- Test: `tests/browser-lookup-service.test.ts`
- Modify: `src/processor/response.ts`
- Modify: `src/graphql/queries.ts`

- [ ] **Step 1: Write the failing service tests**

```ts
it('normalizes the incoming code and returns the exact translated scene match', async () => {
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify({
      data: {
        searchScene: [
          { code: 'SSIS-828', title: '日文标题', details: '日文简介' },
          { code: 'SSIS-829', title: '别的标题', details: '别的简介' },
        ],
      },
    }))
  );

  const result = await lookupSceneByCode('ssis-828', 'user-key');

  expect(result).toEqual({
    code: 'SSIS-828',
    title: '中文标题',
    description: '中文简介',
    translated: true,
  });
});

it('throws a not found error when no exact code match is returned', async () => {
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify({ data: { searchScene: [{ code: 'SSIS-829' }] } }))
  );

  await expect(lookupSceneByCode('SSIS-828', 'user-key')).rejects.toMatchObject({
    code: 'NOT_FOUND',
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- tests/browser-lookup-service.test.ts`
Expected: FAIL because the lookup helper and exact-match filtering do not exist.

- [ ] **Step 3: Implement the minimal lookup helper**

```ts
export function normalizeSceneCode(code: string): string {
  return code.trim().toUpperCase();
}
```

```ts
const request: GraphQLRequest = {
  operationName: 'Search',
  query: SEARCH_SCENE_QUERY,
  variables: { term: normalizedCode },
};
```

- [ ] **Step 4: Re-run the service test**

Run: `bun run test -- tests/browser-lookup-service.test.ts`
Expected: PASS for normalization, exact scene selection, and not-found handling.

- [ ] **Step 5: Commit**

```bash
git add src/browser/lookup.ts src/processor/response.ts src/graphql/queries.ts tests/browser-lookup-service.test.ts
git commit -m "feat: add browser scene lookup service"
```

### Task 3: Add failing tests for Tampermonkey page detection and state flow

**Files:**
- Create: `src/browser/userscript-helpers.ts`
- Create: `tests/tampermonkey-userscript-helpers.test.ts`
- Create: `tampermonkey/javstash-browser-lookup.user.js`

- [ ] **Step 1: Write the failing helper tests**

```ts
it('extracts SSIS-828 from a javbus detail url', () => {
  expect(extractJavbusCode('https://www.javbus.com/SSIS-828')).toBe('SSIS-828');
});

it('returns null for unsupported javbus urls', () => {
  expect(extractJavbusCode('https://www.javbus.com')).toBeNull();
});

it('builds the browser lookup request payload using the fixed proxy origin', () => {
  expect(buildLookupUrl('https://javstash.example.com', 'SSIS-828')).toBe(
    'https://javstash.example.com/api/browser/lookup?code=SSIS-828'
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- tests/tampermonkey-userscript-helpers.test.ts`
Expected: FAIL because the userscript helper module does not exist.

- [ ] **Step 3: Implement the minimal helper module and standalone userscript**

```ts
export function extractJavbusCode(url: string): string | null {
  const match = url.match(/^https?:\/\/www\.javbus\.com\/([A-Za-z0-9]+-\d+)\/?$/);
  return match ? normalizeSceneCode(match[1]) : null;
}
```

```js
GM_registerMenuCommand('设置 JavStash ApiKey', () => {
  const current = GM_getValue(STORAGE_KEY, '');
  const next = window.prompt('请输入 JavStash ApiKey', current);
  if (typeof next === 'string') GM_setValue(STORAGE_KEY, next.trim());
});
```

- [ ] **Step 4: Re-run the helper test**

Run: `bun run test -- tests/tampermonkey-userscript-helpers.test.ts`
Expected: PASS for url extraction and lookup URL construction.

- [ ] **Step 5: Commit**

```bash
git add src/browser/userscript-helpers.ts tampermonkey/javstash-browser-lookup.user.js tests/tampermonkey-userscript-helpers.test.ts
git commit -m "feat: add javbus tampermonkey lookup script"
```

### Task 4: Verify the full flow and polish error handling

**Files:**
- Modify: `tests/integration.test.ts`
- Modify: `app/api/browser/lookup/route.ts`
- Modify: `src/browser/lookup.ts`
- Modify: `tampermonkey/javstash-browser-lookup.user.js`

- [ ] **Step 1: Add a failing integration test for the browser lookup route**

```ts
it('serves browser lookup requests end to end', async () => {
  const { GET } = await import('../app/api/browser/lookup/route');
  const response = await GET(
    new NextRequest('http://localhost/api/browser/lookup?code=SSIS-828', {
      headers: { 'x-javstash-api-key': 'user-key' },
    })
  );

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toMatchObject({
    ok: true,
    code: 'SSIS-828',
  });
});
```

- [ ] **Step 2: Run the integration and targeted unit tests to verify the red state**

Run: `bun run test -- tests/browser-lookup-route.test.ts tests/browser-lookup-service.test.ts tests/tampermonkey-userscript-helpers.test.ts tests/integration.test.ts`
Expected: FAIL only where browser lookup wiring is incomplete.

- [ ] **Step 3: Finish minimal error mapping and userscript panel copy**

```ts
if (error instanceof BrowserLookupError) {
  return NextResponse.json(
    { ok: false, error: error.code, message: error.message },
    { status: error.status }
  );
}
```

```js
if (!apiKey) {
  renderPanel({ state: 'missing-key' });
  return;
}
```

- [ ] **Step 4: Run verification**

Run: `bun run test -- tests/browser-lookup-route.test.ts tests/browser-lookup-service.test.ts tests/tampermonkey-userscript-helpers.test.ts tests/integration.test.ts && bun run typecheck`
Expected: PASS with the new browser lookup API and userscript helpers covered.

- [ ] **Step 5: Commit**

```bash
git add app/api/browser/lookup/route.ts src/browser/lookup.ts tampermonkey/javstash-browser-lookup.user.js tests/browser-lookup-route.test.ts tests/browser-lookup-service.test.ts tests/tampermonkey-userscript-helpers.test.ts tests/integration.test.ts
git commit -m "feat: add tampermonkey browser lookup flow"
```
