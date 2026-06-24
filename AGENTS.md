<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint (flat config, next core-web-vitals + typescript)
npm run typecheck  # tsc --noEmit
npm test           # Vitest run (single run, not watch)
```

No combined `check` script exists. Run `lint → typecheck → test` in order when verifying changes.

## Route protection

Route protection uses `src/proxy.ts` (Next.js 16 pattern), **not** `middleware.ts`. Do not create a `middleware.ts` file.

Protected routes are defined in `ADMIN_ROUTES` inside `proxy.ts`:
- `/dashboard`
- `/projects/new`, `/projects/:id/edit`
- `/payments/new`, `/payments/:id/edit`, `/expenses/new`

All other routes are public (no auth).

## Auth functions

All in `src/lib/auth/admin.ts`:

| Function | Use when |
|----------|----------|
| `getAdminUser()` | Need user info without throwing (returns `{ supabase, user, isAdmin }`) |
| `requireAdmin()` | Page component — redirects to `/login` if not authed |
| `requireAdminResponse()` | Route handler — returns 401/403 Response objects |
| `assertAdmin(request)` | `proxy.ts` only — creates its own Supabase client from request cookies |

Always call `requireAdmin()` at the top of admin page components AND inside server actions (defense in depth).

## Supabase clients

Two clients, different imports:

- **Server:** `import { createClient } from '@/lib/supabase/server'` — async (`await cookies()`), cookie-based session
- **Browser:** `import { createClient } from '@/lib/supabase/client'` — sync, for client components

Server client must be awaited: `const supabase = await createClient()`

## Environment variables

Canonical names (validated in `src/lib/env.ts`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

`assertAdmin()` also falls back to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for `NEXT_PUBLIC_SUPABASE_ANON_KEY`. If you change one, update both locations.

## Server actions pattern

Every server action follows this pattern:

```typescript
async function createAction(formData: FormData) {
  'use server'
  const { supabase, user } = await requireAdmin()  // auth check inside action
  const parsed = schema.safeParse(raw)               // Zod validation
  if (!parsed.success) {
    await setFlash('error', parsed.error.issues.map(i => i.message).join(', '))
    redirect('/path')
    return
  }
  // ... supabase insert/update ...
  await setFlash('success', 'Done.')
  redirect('/path')
}
```

Use `setFlash()` + `redirect()` for user feedback — not `useState` or toast libraries.

## Public vs Admin routes

| Route | Access | Auth method |
|-------|--------|-------------|
| `/projects`, `/payments`, `/expenses` (list pages) | Public | None (RLS: public read) |
| `/projects/[id]` (detail) | Public | None |
| `/login` | Public | — |
| `/dashboard`, `*/new`, `*/edit` | Admin | `proxy.ts` + `requireAdmin()` |

Public pages use `revalidate = 3600` (ISR). Admin pages should not set revalidation.

## Database

- Supabase PostgreSQL with Row Level Security (RLS)
- Do NOT run migrations that modify or delete existing data without explicit request
- Schema types in `src/lib/types/database.ts` — hand-maintained, not auto-generated
- No Prisma — queries use `@supabase/supabase-js` directly

## Security

`.env.local` contains `SUPABASE_SERVICE_ROLE_KEY` — this is a privileged secret. Do not expose, log, or reference it in client-side code. It should not be committed to git (rotate if exposed).
