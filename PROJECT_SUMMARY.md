# Masharie System — Project Build Spec

> **Last updated:** 2026-06-19
> **Audience:** Internal development team
> **Purpose:** Build spec for the Next.js rewrite — greenfield project, no legacy code carried over

---

## 1. Overview

A role-based project management dashboard that manages community development projects (mosques, houses, schools, water tanks, wells, food aid). Tracks projects, donors, budgets, payment releases, and expenses. All amounts in Philippine Peso (₱).

**Two access levels:** Public (no auth) for viewing projects, payments, and expenses. Admin (login required) for dashboard access, mutations, and user management.

This is a greenfield Next.js build. Nothing is carried over from the previous Vite SPA.

> **Data migration note:** The Supabase database already contains production data (536 projects, 774 payment releases, 91 expenses, 2 users). The rewrite connects to the existing database — do not start from scratch.

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 App Router |
| Language | TypeScript (strict) |
| React | React 19 |
| Styling | Tailwind CSS 4 |
| UI primitives | shadcn/ui, Radix Slot/Tabs |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |
| Auth | Supabase Auth (Email/Password for admin only; Google OAuth optional) |
| Database | Supabase PostgreSQL + RLS |
| Server data | Supabase SSR server client (cookie-based) |
| Route protection | `proxy.ts` (replaces deprecated middleware.ts in Next.js 16) |
| Charts | Recharts 3.8 |
| Date utilities | date-fns |
| Testing | Vitest |
| Static checks | ESLint + TypeScript strict |
| Hosting | Vercel |

### Next.js 16 Notes

- Use App Router from the start.
- Server Components as default for data-heavy pages.
- Server Actions for mutations, always gated by auth first.
- React 19 ref-as-prop pattern (no unnecessary forwardRef wrappers).
- `proxy.ts` replaces the deprecated `middleware.ts` for route protection and redirects.
- Use `@supabase/ssr` for cookie-based auth (handles session refresh automatically).
- Confirm dependency compatibility with Next.js 16 before adding packages.

### Package Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",
  "typecheck": "tsc --noEmit"
}
```

---

## 3. Route Structure

```
/projects                         — public project list (no auth)
/payments                         — public payment releases list (no auth)
/expenses                         — public expenses list (no auth)
/login                           — admin login (email/password)
/dashboard                        — protected admin shell (everything below requires auth)
  /projects/new                  — create project
  /projects/[id]/edit            — edit project
Note: Detail pages (project/[id], payment detail, expense detail, user detail)
are accessed via the list pages — no separate top-level routes needed.
```

---

## 4. Core Pages & Behavior

### Access Control

| Area | Public (no auth) | Admin (authenticated) |
|------|-----------------|----------------------|
| Projects list | View only | Full CRUD + detail + phases |
| Payments list | View only | Full CRUD + approve/cancel |
| Expenses list | View only | Full CRUD |
| Users | — | Manage roles |
| Dashboard overview | — | Full access |

Public pages: no login, no auth gating. Data is read-only.

Admin pages: protected by `proxy.ts` — unauthenticated users redirected to `/login`.

Implementation: Use Supabase anon client for public pages (RLS: public read). Use authenticated server client for admin pages (server-side auth check in every server action).

### Login

- Admin-only: email/password login via Supabase Auth
- No Google OAuth for v1 (can be added later)
- Redirects to `/dashboard` on success
- Zod validation on inputs
- Clear error messaging for invalid credentials

### Dashboard Overview

- Summary cards: Total Projects, Active Projects, Total Budget, Total Released
- Charts: Projects by Status (PieChart), Budget by Type (BarChart), Monthly Releases (AreaChart)
- Recent activity table (latest 10 projects)
- Navigation into all modules

### Projects List

- Search by project number, name, donor, supervisor, or address
- Filter by status, type, batch year, donor, supervisor
- Pagination with stable URL parameters (query params for shareable links, e.g. `?status=Completed&type=Mosque`)
- Empty state when no projects match: icon + "No projects match your filters. [Clear filters]" button
- "New Project" button (admin only)
- Mobile-aware layout
- **SEO:** `<title>` and meta description per page. Add `X-Robots-Tag: noindex` header via `proxy.ts` if public pages should not be indexed.
- **CSV export:** "Download this view" button to export filtered results as CSV (for sharing with stakeholders)
- **ISR:** Use `revalidate = 3600` (1 hour) — pages build statically on deploy, revalidate in background

Implementation detail: dedicated filter helpers in `lib/projects/project-filters.ts`, parsing/serialization tested.

### Project Detail

- Show all project fields
- Funding progress (budget vs. released)
- Related payment releases
- Tabs: Overview, Phases, Payments, Files
- Admin-only status updates
- Delete only when no payment releases exist
- Revalidate dashboard, list, and detail after mutations
- Parallelize independent fetches with `Promise.all`

### Project Create/Edit

- Zod schema: project number (format YYYY-NNNNN), name, donor, type, area, supervisor, address, batch, budget, status
- Has Tank checkbox → conditionally reveals Size field
- `created_by` set from authenticated admin, never from browser data

### Payments List

- Search/filter by status, date range, project, released-by
- Join project and releasing-user display data
- Pinned totals row at bottom
- Empty state when no records match: icon + "No payments match your filters. [Clear filters]"
- **CSV export:** "Download this view" button
- **ISR:** `revalidate = 3600`

### Payment Detail

- Amount, check/voucher number, status, release date, notes, linked project, releasing user
- Admin can approve or cancel a pending release
- Invalid transitions blocked
- Confirm dangerous actions before submit

### Payment Create/Edit

- Zod schema: project (searchable select), check number, voucher number, amount, notes, status, released date
- Amount must be positive
- `released_by` from authenticated admin, not form input
- When editing and moving between projects, revalidate both old and new project

### Expenses List

- Filter by account type, status, date range
- Totals grouped by account type
- Empty state when no records match: icon + "No expenses match your filters. [Clear filters]"
- **CSV export:** "Download this view" button
- **ISR:** `revalidate = 3600`

### Expense Create/Edit

- Zod schema: date, check number, voucher number, amount, purpose, requested by, account type, status
- Admin only

### Users List

- Show registered users from `users` table
- Search by name/email
- Filter by role using `userRole` URL param (never `role`)
- Empty state when no users match

### User Detail & Role Management

- Full name, email, current role, joined date, user ID
- Admin can update full name and role
- Admin cannot demote their own account
- Final remaining admin account cannot be demoted
- Database is the final authority for role changes

Security: Do not use `.from("users").update({ role })` directly. Use the `admin_update_user_profile` RPC with all validation rules inside the database function.

---

## 5. Database Schema

### `users`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | references `auth.users(id)` |
| `email` | text unique | copied from auth user |
| `full_name` | text nullable | editable |
| `role` | text | `admin` or `member`, default `member` |
| `created_at` | timestamptz | default `now()` |

### `projects`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | generated by database |
| `project_number` | text unique | format: YYYY-NNNNN |
| `name` | text | |
| `donor` | text | |
| `type` | text | Mosque / House / Store / School Room / Tank / Well / School / Food Aid / Markaz |
| `area_sqm` | numeric nullable | non-negative |
| `supervisor` | text | |
| `address` | text | |
| `batch_number` | text | |
| `batch_year` | integer | |
| `budget` | numeric | non-negative, PHP |
| `status` | text | Pending / On Going / On Hold / Completed / Cancelled |
| `has_tank` | boolean | |
| `size` | text | conditional on has_tank |
| `created_by` | uuid FK | references `users(id)` |
| `created_at` | timestamptz | default `now()` |
| `updated_at` | timestamptz | maintained by trigger |

### `payment_releases`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | generated by database |
| `project_id` | uuid FK | references `projects(id)`, delete restricted |
| `check_number` | text nullable | |
| `voucher_number` | text nullable | |
| `amount` | numeric | must be > 0 |
| `status` | text | Pending / Released / Cancelled |
| `notes` | text nullable | |
| `released_by` | uuid FK | references `users(id)` |
| `released_at` | timestamptz nullable | |
| `released_date` | date | |
| `created_at` | timestamptz | default `now()` |

### `expenses`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | generated by database |
| `date` | date | |
| `check_number` | text | |
| `voucher_number` | text | |
| `amount` | numeric | PHP |
| `purpose` | text | |
| `requested_by` | text | |
| `account_type` | text | Project Account / Expenses Account / Savings Account |
| `status` | text | Released / Cancelled |
| `created_by` | uuid FK | references `users(id)` |
| `created_at` | timestamptz | default `now()` |

### `project_phases`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | generated by database |
| `project_id` | uuid FK | references `projects(id)`, cascade delete |
| `name` | text | |
| `created_at` | timestamptz | default `now()` |

### `project_files`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | generated by database |
| `phase_id` | uuid FK | references `project_phases(id)`, cascade delete |
| `file_name` | text | |
| `file_path` | text | Supabase Storage path |
| `file_type` | text | MIME type |
| `file_size` | integer | bytes |
| `uploaded_by` | uuid FK | references `users(id)` |
| `created_at` | timestamptz | default `now()` |

### Storage: `project-files` bucket

| Setting | Value |
|---------|-------|
| Visibility | Private (signed URLs only) |
| Max file size | 10 MB |
| Accepted types | JPG, PNG, WebP, PDF |

---

## 6. Database Functions

### `update_updated_at()`

Trigger function: updates `projects.updated_at` automatically on row update.

### `handle_new_user()`

Trigger function: creates or updates `public.users` row when a Supabase Auth user is created.

### `user_is_admin(user_id uuid default auth.uid())`

Security-definer function: checks whether a user has role `admin`.

### `admin_update_user_profile(target_user_id, target_full_name, target_role)`

Security-definer function for admin-managed user updates. Must enforce:

- Actor is authenticated
- Actor is admin
- Target role is valid
- Target user exists
- Admin cannot demote self
- Final admin cannot be removed
- Update happens inside the database, not through client-owned role write

---

## 7. RLS Policies

Enable RLS on: `users`, `projects`, `payment_releases`, `expenses`, `project_phases`, `project_files`

Policy principles:

1. Public (anon) can read projects, payment_releases, expenses
2. Users can read their own profile
3. Admins can read all users
4. Users can update their own non-role profile data only
5. Admin user-management writes go through the RPC function, not a broad policy
6. Admins can create/update/delete projects, payment_releases, expenses
7. Admins can create/update/delete project_phases and project_files
8. Avoid unconditional write policies (`WITH CHECK (true)`)
9. Avoid broad client-reachable policies trusting browser-provided owner/role fields

Storage policies: private bucket, public read via signed URLs for public pages, admin-only insert/update/delete.

---

## 8. Auth & Authorization Model

### Public Pages (No Auth)

`/projects`, `/payments`, `/expenses` — accessible to anyone. Read-only. No login required.

- Use Supabase anon client (no session)
- RLS: public SELECT policies on projects, payment_releases, expenses
- No create/update/delete — UI doesn't render, server actions don't exist

### Admin Pages (Auth Required)

`/dashboard`, `/projects/new`, `/projects/[id]/edit`, `/payments/new`, `/expenses/new` — protected.

`proxy.ts` flow:

1. Check Supabase session via `createServerClient`
2. If no session → redirect to `/login`
3. If session but not admin → redirect away from admin pages

### Server Action Gates

Every privileged server action must begin with an explicit authorization gate:

```ts
const profile = await requireAuth();
```

Actions requiring auth:

| Action | Required authorization |
|--------|----------------------|
| Create project | Admin |
| Update project | Admin |
| Change project status | Admin |
| Delete project | Admin |
| Create payment release | Admin |
| Update payment release | Admin |
| Approve/cancel payment | Admin |
| Update user profile/role | Admin + DB-side role checks |
| Sign out | Authenticated user |

Why: A Next.js server action can be called directly. Hiding a button is not security. The action itself must prove who is calling.

---

## 9. Frontend Standards

### React 19 Refs

Use ref-as-prop style. Avoid unnecessary `React.forwardRef()` wrappers.

Applied to: Button, Card, Input, Label, Tabs, Textarea

### Accessibility

- Every form control has a label or accessible name
- Empty states explain what happened + what to do next
- Destructive actions require confirmation
- Keyboard users can navigate forms and actions
- Color is not the only status indicator (badges + text)
- Text contrast ≥ 4.5:1 (WCAG AA)
- Visible focus rings on all focusable elements
- `aria-label` on icon-only buttons
- `prefers-reduced-motion` respected

### Mobile & Layout

- Sidebar for desktop
- Mobile navigation drawer/topbar for small screens
- Tables handle horizontal overflow or convert to responsive cards
- Consistent search/filter/pagination patterns across list pages
- Breakpoints tested: 375px, 768px, 1024px, 1440px

---

## 10. Data Fetching & Performance

### Public Page Caching (React 19 `cache()`)

Wrap public fetch calls in React 19's `cache()` to deduplicate requests within a single page render:

```ts
import { cache } from "react";

export const getProjects = cache(async (filters) => {
  // fetch from Supabase
});
```

Combine with ISR (`revalidate = 3600`) for static generation with background updates.

### Pagination Strategy

Use **keyset pagination** (cursor-based) instead of OFFSET for public pages:

```ts
// Good: fast at any page number
.supabase
  .from("projects")
  .select("*")
  .order("created_at", { ascending: false })
  .gt("id", cursor)
  .range(start, end)

// Bad: slow at high offsets
.supabase.from("projects").select("*").range(5000, 5050)
```

At 536 projects and growing, OFFSET works today but will degrade. Keyset is future-proof and costs nothing extra to implement.

### Data Access Layer

Split queries per module instead of one monolithic `queries.ts`:

```
lib/supabase/queries/
  ├── projects.ts      — getProjects, getProjectById, createProject, updateProject, deleteProject
  ├── payments.ts      — getPayments, getPaymentById, createPayment, updatePayment, approvePayment
  ├── expenses.ts      — getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense
  ├── users.ts         — getUsers, getUserById, updateUserRole
  └── dashboard.ts     — getDashboardStats, getRecentActivity
```

### Parallelize Independent Awaits

```ts
const [query, payment] = await Promise.all([
  searchParams,
  getPayment(id),
]);
```

- Detail pages parallelize searchParams and record fetches
- New payment page parallelizes search params and project options
- Payment list resolves filter IDs in parallel
- Do not parallelize operations with real ordering dependencies

### Cache Invalidation (Admin Mutations)

After mutations, revalidate affected surfaces:

- Dashboard overview
- Projects list
- Project detail
- Payments list
- Payment detail
- Old and new project pages when a payment changes project

### Performance Checklist

- Parallelize independent async work in sign-out and other server flows
- Hoist repeated `Intl.NumberFormat` creation
- Replace spread-then-sort with `toSorted()` where supported
- Dynamically import heavy chart components

---

## 11. Security

### Supabase Key Isolation

Client-side code must use only `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / anon access. Keep privileged database changes behind server-side auth checks and database policies.

### Rate Limiting on Public Endpoints

Public pages (anon Supabase access) have no built-in rate limiting. Mitigation options:
- Supabase dashboard: enable API rate limiting (free tier: 100 requests/second)
- `proxy.ts`: add simple in-memory rate limiter for `/api/*` routes
- At minimum, document the abuse surface and monitor Supabase logs

### CSRF & Server Action Security

Next.js Server Actions are protected by default via `Host` header validation. Confirm:
- No Server Action accepts sensitive operations without re-validation
- All mutations require admin auth via `requireAuth()`
- `Origin`/`Referer` headers are checked (Next.js handles this automatically)

### SEO & robots.txt

Add `public/robots.txt` to disallow crawling if public pages should not be indexed:

```
User-agent: *
Disallow: /
```

Or add `X-Robots-Tag: noindex` header in `proxy.ts` for public routes only.

---

## 12. Validation & Forms

Use Zod schemas for: login, project, payment, expense, and filter forms.

Rules:

- Client-side validation is for UX only
- Server actions must re-validate submitted form data
- Database constraints/RLS remain the final security layer
- Do not trust hidden form fields for authorization (owner, user, tenant, role, admin flags)

---

## 13. Testing

Use Vitest for unit tests around logic-heavy helpers.

Must cover:

- Auth route decisions
- Signup/login messaging
- Dashboard navigation definitions
- Project schemas and helpers
- Project filter parsing/serialization
- Payment schemas and status transitions
- Payment filter parsing/serialization
- Payment project option formatting
- User filter parsing/serialization
- User role-change policy
- Detail/list page helper logic
- Report metrics
- Supabase migration text checks for security/policy patterns
- Next cache cleanup script behavior

---

## 14. Quality Workflow

```bash
npm test          # after logic changes
npm run typecheck # after schema, data, or component API changes
npm run lint      # before handing off or deploying
```

Policy:

1. Run tests after logic changes
2. Run typecheck after schema, data, or component API changes
3. Run lint before handing off or deploying
4. Fix security and accessibility issues as part of normal development
5. Keep a short local checklist for known follow-up warnings

---

## 15. Build Phases

### Phase 1 — Foundation ✅ COMPLETE

- Create Next.js App Router project with TypeScript and Tailwind
- Install all packages
- Configure package scripts
- Create base layout, global styles, shared UI primitives
- React 19 ref-as-prop style from day one
- Set up Supabase anon client for public pages
- Create `supabase/migrations/` folder for versioned SQL files

### Phase 2 — Database & Auth ✅ COMPLETE

Tables already exist with data (536 projects, 774 payments, 91 expenses, 2 users). Focus on functions + policies:

- Create missing trigger functions: `update_updated_at()`, `handle_new_user()`
- Create RPC function: `admin_update_user_profile(target_user_id, target_full_name, target_role)`
- Set storage bucket `project-files` file_size_limit to 10MB
- Verify/complete RLS policies for public read + admin write
- Build Supabase server/browser clients
- Build admin login page (email/password only)
- Build `proxy.ts`: protect admin routes, redirect to /login
- Public pages use anon client — no auth check

### Phase 3 — Public Pages ✅ COMPLETE

- Build projects list page with search, filter, pagination
- Build project detail page with funding progress and payment releases
- Build payments list page with filter and pagination
- Build expenses list page with filter and pagination
- All pages use ISR (revalidate = 3600)

### Phase 4 — Admin Pages

- Build admin login page
- Build dashboard overview with stats cards and charts
- Build project create/edit forms
- Build payment create/edit forms
- Build expense create/edit forms
- Build user management (list, detail, role change)
- Add tests

### Phase 5 — Deprecated

Reports and PDF export were removed from scope.

### Phase 6 — Polish & Quality Pass

- Loading and error states
- Empty states
- Accessibility pass
- Hoist expensive Intl formatters
- Replace spread-sort with toSorted()
- Split multi-component files when maintainability suffers
- Run full quality gates before launch

---

## 16. Quality Gate (Pre-Launch)

```bash
npm test
npm run typecheck
npm run lint
```

Expected baseline:

- Tests pass
- TypeScript passes (no errors)
- ESLint passes (no errors)
- Remaining quality warnings explicitly accepted as follow-up

---

## 17. Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#7C3AED` | Buttons, active nav, focus rings |
| Secondary | `#A78BFA` | Accents, hover highlights |
| Success / CTA | `#22C55E` | Positive actions, Completed |
| Danger | `#EF4444` | Errors, destructive actions, Cancelled |
| Warning | `#F59E0B` | On Hold, pending alerts |
| Background | `#FAF5FF` | Page background |
| Text | `#4C1D95` | Body text, headings |
| Heading Font | Fira Code | Section titles, labels, project numbers |
| Body Font | Fira Sans | Paragraphs, table content, forms |

Style direction: financial dashboard — clean, data-dense, authoritative.

---

## 18. Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 19. Packages

```bash
npm install date-fns @supabase/ssr
npm install -D vitest eslint typescript
```

> `date-fns` ships its own types — no `@types/date-fns` needed.
> `@supabase/ssr` handles cookie-based session management for Next.js.

---

## 20. File Structure

```
src/
app/
  dashboard/page.tsx
  expenses/page.tsx
  expenses/new/page.tsx
  login/page.tsx
  payments/page.tsx
  payments/new/page.tsx
  projects/page.tsx
  projects/new/page.tsx
  projects/[id]/page.tsx
  projects/[id]/edit/page.tsx
components/
  dashboard/dashboard-charts.tsx
  projects/projects-table.tsx
  payments/payments-table.tsx
lib/
  supabase/client.ts
  supabase/server.ts
  supabase/queries/
  types/database.ts
  utils/
proxy.ts
```

---

## 21. Database Status (Verified Against Supabase)

### Tables — All 6 exist and match spec

| Table | Row Count | Column Match |
|-------|-----------|-------------|
| `projects` | 536 | ✅ Spec matches |
| `payment_releases` | 774 | ✅ Spec matches |
| `expenses` | 91 | ✅ Spec matches |
| `users` | 2 | ✅ Spec matches |
| `project_phases` | 3 | ✅ Spec matches |
| `project_files` | 3 | ✅ Spec matches |

### Database Functions — Partially Exist

| Function | Status | Action |
|----------|--------|--------|
| `current_user_role()` | ✅ Exists | Keep |
| `user_is_admin()` | ✅ Exists | Keep |
| `update_updated_at()` | ❌ Not found | Create trigger function |
| `handle_new_user()` | ❌ Not found | Create trigger function |
| `admin_update_user_profile()` | ❌ Not found | Create RPC function |

### RLS Status

- Anon key can currently read all 6 tables (public read already works).
- Need to verify write policies exist for admin operations.
- After Next.js rewrite: add authenticated client + admin role checks on server actions.

### Storage

- `project-files` bucket exists (private).
- `file_size_limit` is NULL — needs to be set to 10MB (10485760 bytes) via SQL:
  ```sql
  UPDATE storage.buckets SET file_size_limit = 10485760 WHERE name = 'project-files';
  ```

---

## 22. Key Principles

1. Add quality checks early, not after the app grows.
2. Treat server actions as public endpoints until they prove authentication and authorization.
3. Never trust browser-submitted authorization fields.
4. Keep RLS policies narrow and explicit.
5. Use database functions for sensitive role/user management transitions.
6. Avoid sensitive action names in URL filters.
7. Parallelize independent server work, preserve ordering when correctness depends on it.
8. Build shared filter parsing/serialization helpers and test them.
9. Keep UI primitives React 19-ready from the start.
10. Make tests, lint, and typecheck part of the normal workflow.
