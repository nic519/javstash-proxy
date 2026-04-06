# Clerk Authentication Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current JavStash API key login flow with Clerk email/password sign-up and sign-in while preserving the existing product rule that any authenticated user can open `/admin` and `/playground`, but only admins can edit or delete data.

**Architecture:** Use Clerk as the hosted authentication layer for App Router and move route protection into Clerk's `proxy.ts`. Keep the current business permissions model by translating Clerk auth state into two app-level roles: authenticated user and admin user. Determine admin status from an environment-driven email allowlist in the first release so the migration stays simple and does not require a separate role-management UI.

**Tech Stack:** Next.js 16 App Router, React 19, Clerk Next.js SDK, existing Turso data layer, Vitest

---

### Task 1: Install Clerk and wire the App Router shell

**Files:**
- Create: `proxy.ts`
- Modify: `package.json`
- Modify: `app/layout.tsx`
- Modify: `README.md`
- Test: `tests/sidebar.test.ts`

- [ ] **Step 1: Add the Clerk dependency using the existing package manager**

```bash
bun add @clerk/nextjs
```

- [ ] **Step 2: Add the Clerk provider to the root layout**

```tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" className={cn('dark font-sans', geist.variable)}>
      <body className="antialiased" style={{ background: 'var(--bg-primary)' }}>
        <ClerkProvider>
          {children}
          <Toaster position="bottom-center" richColors />
        </ClerkProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Add Clerk middleware in `proxy.ts`**

```ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

- [ ] **Step 4: Document the required Clerk environment variables**

```md
CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
ADMIN_EMAILS=admin@example.com
```

- [ ] **Step 5: Run a focused verification**

Run: `bun run typecheck`
Expected: PASS with `@clerk/nextjs` imports resolving in `app/layout.tsx` and `proxy.ts`.

### Task 2: Replace local cookie auth with Clerk-backed permission helpers

**Files:**
- Create: `lib/authz.ts`
- Modify: `lib/session-permissions.ts`
- Modify: `app/api/session/route.ts`
- Delete: `lib/auth.ts`
- Test: `tests/auth-permissions.test.ts`

- [ ] **Step 1: Write failing permission tests around the new auth shape**

```ts
describe('auth permissions', () => {
  it('allows any signed-in user to access protected pages', () => {
    expect(canAccessApp({ userId: 'user_123', isAdmin: false })).toBe(true);
    expect(canAccessApp({ userId: null, isAdmin: false })).toBe(false);
  });

  it('only allows admins to mutate cached data', () => {
    expect(canManageAdminData({ userId: 'user_123', isAdmin: true })).toBe(true);
    expect(canManageAdminData({ userId: 'user_123', isAdmin: false })).toBe(false);
  });
});
```

- [ ] **Step 2: Add a small Clerk-to-app permission adapter**

```ts
export interface AppAuthState {
  userId: string | null;
  isAdmin: boolean;
  email: string | null;
}

export function isAdminEmail(email: string | null): boolean {
  if (!email) return false;
  const allowlist = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return allowlist.includes(email.toLowerCase());
}
```

- [ ] **Step 3: Return the new session payload from `/api/session`**

```ts
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({
      authenticated: false,
      userId: null,
      email: null,
      isAdmin: false,
    });
  }

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? null;

  return NextResponse.json({
    authenticated: true,
    userId,
    email,
    isAdmin: isAdminEmail(email),
  });
}
```

- [ ] **Step 4: Remove the legacy cookie session implementation**

```ts
// Delete lib/auth.ts after all imports have moved to Clerk-backed helpers.
```

- [ ] **Step 5: Run focused permission tests**

Run: `bun run test -- tests/auth-permissions.test.ts`
Expected: PASS with no remaining references to `admin_session`, `javstash`, or local session token parsing.

### Task 3: Move route protection and admin API authorization to Clerk

**Files:**
- Modify: `proxy.ts`
- Modify: `app/api/admin/translations/route.ts`
- Modify: `app/api/admin/translations/[code]/route.ts`
- Delete: `middleware.ts`
- Test: `tests/admin-translations-route.test.ts`

- [ ] **Step 1: Extend `proxy.ts` to enforce sign-in on protected pages**

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/admin(.*)', '/playground(.*)', '/api/admin(.*)']);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
});
```

- [ ] **Step 2: Keep write permissions server-side in the admin APIs**

```ts
const authState = await getAppAuthState();

if (!canManageAdminData(authState)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

- [ ] **Step 3: Delete the old custom middleware**

```ts
// Delete middleware.ts once all route protection has moved into proxy.ts.
```

- [ ] **Step 4: Add or update admin route tests for GET versus mutation access**

```ts
it('rejects non-admin mutations', async () => {
  getAppAuthStateMock.mockResolvedValue({
    userId: 'user_123',
    email: 'user@example.com',
    isAdmin: false,
  });

  const response = await PATCH(request);
  expect(response.status).toBe(403);
});
```

- [ ] **Step 5: Run route-level verification**

Run: `bun run test -- tests/admin-translations-route.test.ts`
Expected: PASS with GET routes available to signed-in users and write paths blocked for non-admins.

### Task 4: Replace the homepage login UI with Clerk sign-up and sign-in

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/Navigation.tsx`
- Modify: `app/admin/page.tsx`
- Test: `tests/sidebar.test.ts`
- Test: `tests/admin-page-header.test.ts`

- [ ] **Step 1: Remove the old API key and admin password form from the homepage**

```tsx
// Delete LoginType, password state, handleSubmit, and the tabbed form UI.
```

- [ ] **Step 2: Render Clerk buttons on the landing page**

```tsx
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

<Show when="signed-out">
  <div className="flex gap-3">
    <SignUpButton>
      <Button>注册后进入调试</Button>
    </SignUpButton>
    <SignInButton>
      <Button variant="outline">已有账号登录</Button>
    </SignInButton>
  </div>
</Show>

<Show when="signed-in">
  <div className="flex items-center gap-3">
    <Button onClick={() => router.push('/admin')}>进入控制台</Button>
    <UserButton />
  </div>
</Show>
```

- [ ] **Step 3: Update navigation logout behavior to use Clerk UI**

```tsx
import { UserButton } from '@clerk/nextjs';

<UserButton
  appearance={{
    elements: {
      userButtonAvatarBox: 'h-9 w-9',
    },
  }}
/>
```

- [ ] **Step 4: Switch admin-page permission state from `sessionType` to `isAdmin`**

```ts
const [isAdmin, setIsAdmin] = useState(false);

useEffect(() => {
  fetch('/api/session')
    .then((res) => res.json())
    .then((data) => {
      setIsAdmin(Boolean(data.isAdmin));
    });
}, []);

const canManage = canManageAdminData({
  userId: 'client-session',
  isAdmin,
});
```

- [ ] **Step 5: Run focused UI tests**

Run: `bun run test -- tests/sidebar.test.ts tests/admin-page-header.test.ts`
Expected: PASS after removing the legacy login form and keeping logged-in navigation behavior intact.

### Task 5: Clean up legacy auth references and finish regression coverage

**Files:**
- Modify: `README.md`
- Modify: `app/page.tsx`
- Modify: `tests/auth-permissions.test.ts`
- Modify: `tests/integration.test.ts`
- Modify: `tests/sidebar.test.ts`

- [ ] **Step 1: Remove product copy that mentions using JavStash API keys for website login**

```md
- 注册或登录后可进入 `/admin` 与 `/playground`
- 普通用户可浏览数据
- 管理员用户可编辑和删除缓存
```

- [ ] **Step 2: Keep API key documentation only for upstream GraphQL proxy usage**

```md
请求 `/api/graphql` 时仍需携带 JavStash 的 `ApiKey` Header，这与网站登录无关。
```

- [ ] **Step 3: Add regression assertions for the new homepage behavior**

```ts
expect(markup).not.toContain('API Key');
expect(markup).toContain('注册');
expect(markup).toContain('登录');
```

- [ ] **Step 4: Run the full local verification suite**

Run: `bun run test`
Expected: PASS

- [ ] **Step 5: Run final type verification**

Run: `bun run typecheck`
Expected: PASS with no references to `validateJavStashKey`, `admin_session`, `SessionType = 'javstash'`, or `/api/auth`.
