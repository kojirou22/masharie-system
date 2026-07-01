# Masharie System Frontend Redesign Plan

> For Hermes: Use `subagent-driven-development` if executing this plan with multiple workers. Implement phase-by-phase, verify after each phase, and do not touch backend/database logic unless a frontend compile error exposes a type contract issue.

Goal: Redesign the entire Masharie System frontend into a polished dashboard-style operations interface with a collapsible sidebar, stronger visual system, improved data density, responsive mobile behavior, and verified build quality.

Architecture: Keep the current Next.js App Router structure and Supabase query layer intact. Replace the current top-navigation shell with a reusable dashboard shell, then migrate each route into shared layout primitives: page headers, metric cards, filter panels, tables, forms, empty states, and responsive navigation. The redesign should improve the UI without changing database schema, auth flow, or core server actions.

Tech Stack:
- Next.js 16.2.9 App Router
- React 19.2.4
- Tailwind CSS v4
- Supabase SSR/client libraries already present
- lucide-react icons already present
- Optional: shadcn/ui components if the implementation chooses to adopt them. If used, initialize non-interactively with `npx shadcn@latest init -d --base radix` and fix Tailwind v4 font tokens afterward.

Estimated duration: 2-4 focused days.

Current frontend scope inspected:
- 32 TSX files
- ~4,376 TSX lines
- Main app files:
  - `src/app/layout.tsx`
  - `src/components/app-nav.tsx`
  - `src/app/globals.css`
  - `src/app/page.tsx`
  - `src/app/dashboard/page.tsx`
  - `src/app/projects/page.tsx`
  - `src/app/projects/[id]/page.tsx`
  - `src/app/projects/new/page.tsx`
  - `src/app/projects/[id]/edit/page.tsx`
  - `src/app/payments/page.tsx`
  - `src/app/payments/new/page.tsx`
  - `src/app/payments/[id]/edit/page.tsx`
  - `src/app/expenses/page.tsx`
  - `src/app/expenses/new/page.tsx`
  - `src/app/expenses/[id]/edit/page.tsx`
  - Shared components under `src/components/**`

Current git state warning:
- `src/app/page.tsx` is already modified.
- `data-import/` is untracked.
- Do not overwrite or discard these without inspecting and confirming intent.

Hard constraints:
- Frontend only. Do not change schema, migrations, Supabase tables, or auth semantics.
- Do not kill/restart the user's running dev server without explicit confirmation.
- Preserve existing workflows: projects, payments, expenses, dashboard, login/logout.
- Preserve server component data fetching unless a client component is genuinely required.
- Arabic-script text must remain normal weight, slightly larger, and readable. Avoid bold/semi-bold Arabic glyphs.
- Keep mobile usable. Do not squeeze desktop sidebar behavior into small screens.
- Final delivery must pass lint, typecheck, tests, and build.

Definition of done:
- App uses a dashboard shell with desktop collapsible sidebar and mobile navigation.
- Every main route uses the new visual system.
- Tables remain dense, readable, horizontally safe, and usable on mobile.
- Forms are clearer, grouped, and responsive.
- Dashboard has professional metric cards and chart surfaces.
- Login, loading, error, empty, unauthorized, and not-found states are visually consistent.
- Existing behavior is preserved.
- Commands pass:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run build`

---

## Design Direction

Target feel: serious dashboard for project/payment/expense operations. Clean, restrained, high-density, not flashy.

Visual principles:
- Use a stable app frame: sidebar + top content bar + main content canvas.
- Prefer neutral/slate surfaces with blue as primary and emerald as success/accent.
- Use compact spacing for registry pages; comfortable spacing for detail/forms.
- Avoid heavy gradients everywhere. Use subtle background only at app level.
- Use cards for meaningful grouping, not decoration.
- Keep typography calm: strong page titles, small muted metadata, monospace only for IDs/numbers where useful.
- Use badges for status/type/payment state.
- Use icons quietly: lucide icons at `h-4 w-4` or `h-5 w-5`.
- Keep Arabic text normal weight: use a helper class like `.arabic-text` or detection helper if needed.

Recommended route hierarchy:
- `/dashboard` as main dashboard home after login.
- `/projects` central registry.
- `/payments` release registry.
- `/expenses` expense registry.
- `/projects/new`, `/payments/new`, `/expenses/new` as primary create flows.
- Detail/edit pages inherit app shell and use consistent page headers.

Navigation items:
- Dashboard: `/dashboard`, icon `LayoutDashboard` or `BarChart3`
- Projects: `/projects`, icon `Landmark`
- Payments: `/payments`, icon `HandCoins`
- Expenses: `/expenses`, icon `FileText`
- New Project: `/projects/new`, icon `PlusCircle` or action button in header
- Optional secondary nav section: Admin / Settings only if already exists. Do not invent routes.

---

## Day 0: Preparation and Baseline

Purpose: protect existing work, understand the exact app surface, and get a clean verification baseline.

### Task 0.1: Confirm current working tree

Objective: avoid overwriting user changes.

Files:
- Read only: git state

Steps:
1. Run:
   ```bash
   git status --short
   ```
2. Inspect existing modified file before editing:
   ```bash
   git diff -- src/app/page.tsx
   ```
3. Decide whether `src/app/page.tsx` changes are part of this redesign or user work to preserve.

Expected result:
- Known list of files that must be preserved.

Do not proceed if there are unrelated risky changes that would be overwritten.

### Task 0.2: Baseline checks

Objective: know whether the project is already passing before redesign.

Commands:
```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Expected:
- Ideally all pass.
- If any fail before implementation, record them as pre-existing failures in the execution notes. Do not hide them.

### Task 0.3: Inventory reusable UI patterns

Objective: identify duplication to replace with shared components.

Inspect:
- `src/app/projects/page.tsx`
- `src/components/projects/projects-table.tsx`
- `src/app/payments/page.tsx`
- `src/components/payments/payments-table.tsx`
- `src/app/expenses/page.tsx`
- `src/components/expenses/expense-row.tsx`
- `src/app/globals.css`
- `src/components/date-range-filter.tsx`
- `src/components/auto-filter-form.tsx`

Output:
- Short notes on repeated page headers, filter bars, table wrappers, status pills, form fields, and action buttons.

---

## Day 1: App Shell and Design System Foundation

Purpose: establish the frame that every page inherits. This determines the whole product feel.

### Phase 1A: Shared UI primitives

### Task 1.1: Create class helper if missing

Objective: make conditional Tailwind classes safer and less noisy.

Files:
- Create if missing: `src/lib/utils/cn.ts`
- Or add to existing utility module if one already exists.

Implementation:
```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Dependency note:
- If `clsx` and `tailwind-merge` are not installed, either install them or implement a minimal local helper.
- If using shadcn/ui, these dependencies will normally be added.

Verification:
```bash
npm run typecheck
```

### Task 1.2: Decide shadcn adoption

Objective: choose between custom primitives and shadcn source components.

Recommended option: adopt shadcn only for high-value primitives:
- `button`
- `card`
- `badge`
- `sheet`
- `separator`
- `dropdown-menu`
- `table`
- `input`
- `label`
- `select`
- `textarea`
- `skeleton`
- `alert`

If adopting shadcn:
```bash
npx shadcn@latest init -d --base radix
npx shadcn@latest add button card badge sheet separator dropdown-menu table input label select textarea skeleton alert tooltip
```

Important Tailwind v4 fix after shadcn init:
- Check `src/app/globals.css`.
- Avoid circular font declarations like `--font-sans: var(--font-sans)`.
- Use literal fallback or existing Geist variables correctly.

If not adopting shadcn:
- Build small local primitives in `src/components/ui/`.

Decision rule:
- Use shadcn if speed and consistency matter more than avoiding dependencies.
- Use custom primitives if minimizing changes matters more.

### Task 1.3: Create dashboard shell component

Objective: replace the top nav layout with a proper dashboard frame.

Files:
- Create: `src/components/layout/dashboard-shell.tsx`
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/top-bar.tsx`
- Modify: `src/app/layout.tsx`
- Modify or replace: `src/components/app-nav.tsx`

Shell requirements:
- Desktop: fixed/sticky sidebar, collapsible width.
- Main content: `min-h-screen`, constrained content where appropriate, full-width tables where needed.
- Top bar: page context area, theme toggle, sign out action if appropriate.
- Mobile: compact top bar + sheet/drawer navigation or keep bottom nav if it tests better.
- Persist collapsed state in `localStorage` using a client component.
- Do not make the whole root layout a client component. Keep client behavior isolated.

Suggested structure:
```tsx
// src/components/layout/dashboard-shell.tsx
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* client sidebar shell inside */}
      {children}
    </div>
  )
}
```

Better structure:
- `DashboardShell` can be server component.
- `DashboardFrame` can be client component for collapse state.

Verification:
```bash
npm run typecheck
npm run lint
```

### Task 1.4: Define navigation model

Objective: centralize nav items so desktop and mobile do not drift.

Files:
- Create: `src/components/layout/nav-items.ts`
- Modify: `src/components/layout/sidebar.tsx`
- Modify: `src/components/app-nav.tsx` or replace it.

Data shape:
```ts
import { BarChart3, FileText, HandCoins, Landmark, PlusCircle } from 'lucide-react'

export const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/projects', label: 'Projects', icon: Landmark },
  { href: '/payments', label: 'Payments', icon: HandCoins },
  { href: '/expenses', label: 'Expenses', icon: FileText },
]

export const actionItems = [
  { href: '/projects/new', label: 'New Project', icon: PlusCircle },
]
```

Acceptance:
- Active route detection works for nested routes.
- Collapsed sidebar still shows icons and accessible labels/tooltips.
- Mobile nav uses same model.

### Task 1.5: Refactor root layout into app shell

Objective: apply shell globally without breaking login and auth pages.

Files:
- Modify: `src/app/layout.tsx`
- Possibly create route group later if login should be outside shell: `src/app/(app)/...` and `src/app/(auth)/login/page.tsx`. Only do this if necessary.

Preferred first pass:
- Keep global shell simple.
- Hide app nav on `/login` and `/unauthorized` via a small client path-aware wrapper if necessary.

Alternative clean architecture:
- Move authenticated routes into route group `(app)` with dashboard layout.
- Move login into `(auth)` group.

Risk:
- Moving routes can create churn. Do route groups only if the shell cannot cleanly handle login.

Verification:
- `/login` still works and does not show inappropriate app chrome.
- Main app routes show sidebar.

### Task 1.6: Clean global theme tokens

Objective: reduce compatibility hacks and define reliable dashboard tokens.

Files:
- Modify: `src/app/globals.css`

Requirements:
- Keep existing `data-theme` behavior unless replacing fully with `next-themes`.
- Define colors for background, foreground, card, muted, border, primary, accent, destructive.
- Add reusable classes:
```css
.arabic-text {
  font-weight: 400;
  font-size: 1.03em;
  line-height: 1.75;
}

.dashboard-surface {
  background: var(--card);
  border: 1px solid var(--border);
}
```

Do not rely entirely on dark-mode compatibility overrides. Start migrating components toward token classes.

Verification:
- Light and dark modes remain readable.
- Inputs/selects keep correct foreground/background in both themes.

Day 1 acceptance criteria:
- Sidebar shell exists.
- Collapse works on desktop.
- Mobile navigation works.
- Existing routes render inside shell or intentionally outside it.
- Lint/typecheck pass or only pre-existing failures remain documented.

---

## Day 2: Registry Pages and Tables

Purpose: migrate the highest-use screens: Projects, Payments, Expenses.

### Phase 2A: Shared page patterns

### Task 2.1: Create shared page header component

Objective: remove repeated header markup and standardize actions.

Files:
- Create: `src/components/layout/page-header.tsx`

Props:
```ts
type PageHeaderProps = {
  title: string
  description?: string
  eyebrow?: string
  badge?: React.ReactNode
  actions?: React.ReactNode
  children?: React.ReactNode
}
```

Usage targets:
- `src/app/projects/page.tsx`
- `src/app/payments/page.tsx`
- `src/app/expenses/page.tsx`
- `src/app/dashboard/page.tsx`
- detail/edit/new pages where useful

Acceptance:
- Page title, count badge, and primary actions align consistently.
- Header supports filters as children where appropriate.

### Task 2.2: Create shared surface/card primitives

Objective: standardize bordered panels and reduce copy-pasted classes.

Files:
- Create: `src/components/ui/surface.tsx`

Possible exports:
```tsx
export function Surface({ className, ...props }: React.ComponentProps<'section'>) {
  return <section className={cn('rounded-2xl border border-border bg-card shadow-sm', className)} {...props} />
}
```

Also consider:
- `MetricCard`
- `SectionHeader`
- `EmptyState`

Acceptance:
- At least Projects, Payments, Expenses can reuse the same shell surface.

### Task 2.3: Create shared filter panel styles

Objective: make search/filter areas compact, readable, and consistent.

Files:
- Create or modify: `src/components/filters/filter-panel.tsx`
- Modify: `src/components/auto-filter-form.tsx`
- Modify: route filter bars inside projects/payments/expenses pages.

Requirements:
- Desktop: filters fit in one compact row where possible.
- Mobile: filters stack cleanly; submit/fallback still works.
- Preserve existing query param names.
- Keep auto-submit behavior if stable.

Acceptance:
- Filtering behavior unchanged.
- Mobile users can still change filters and submit.

### Task 2.4: Create shared status badge helpers

Objective: status styles are consistent across projects/payments/expenses.

Files:
- Create: `src/components/ui/status-badge.tsx`
- Modify status rendering in table/row components.

Suggested statuses:
- Project: Pending, On Going, On Hold, Completed, Cancelled
- Payments: Released or current existing statuses
- Expenses: current existing statuses

Acceptance:
- Statuses are readable in light/dark mode.
- Unknown statuses degrade gracefully.

### Phase 2B: Projects registry

### Task 2.5: Redesign Projects page shell

Files:
- Modify: `src/app/projects/page.tsx`
- Modify: `src/components/projects/projects-table.tsx`
- Modify: `src/components/pagination.tsx` if pagination styling is inconsistent.

Requirements:
- Use `PageHeader`.
- Keep total count badge.
- Keep current filters: search, status, type, batch number, batch year, sort/dir hidden fields.
- Add primary action: `New Project` linking to `/projects/new`.
- Table surface should have sticky header inside bounded overflow wrapper.
- Preserve sorting behavior.

Acceptance:
- Existing query params still work.
- Table does not break viewport on mobile.
- Arabic supervisor/address/project text is normal weight and readable.

### Task 2.6: Redesign Projects table rows

Files:
- Modify: `src/components/projects/projects-table.tsx`

Requirements:
- Dense but readable row height.
- Project number and batch number visually scannable.
- Budget formatted consistently.
- Status/type badges.
- Row action affordance clear.
- Mobile fallback either horizontal scroll or stacked cards. Do not invent complex behavior unless time allows.

Acceptance:
- Click behavior unchanged.
- Sorting links still generate correct URLs.

### Phase 2C: Payments registry

### Task 2.7: Redesign Payments page shell

Files:
- Modify: `src/app/payments/page.tsx`
- Modify: `src/components/payments/payments-table.tsx`

Requirements:
- Use `PageHeader`.
- Add primary action: `New Payment Release` linking to `/payments/new`.
- Preserve filters/date range behavior.
- Payment table clearly shows project(s), check/voucher, amount, release date, status.

Acceptance:
- Existing payment records render correctly.
- Multi-project payment context remains clear.

### Task 2.8: Redesign Payments table

Files:
- Modify: `src/components/payments/payments-table.tsx`

Requirements:
- Sticky header.
- Amounts right-aligned or visually consistent.
- Dates use existing formatting conventions.
- Status badge styles from shared helper.
- Row actions remain accessible.

### Phase 2D: Expenses registry

### Task 2.9: Redesign Expenses page shell

Files:
- Modify: `src/app/expenses/page.tsx`
- Modify: `src/components/expenses/expense-row.tsx`

Requirements:
- Use `PageHeader`.
- Add primary action: `New Expense` linking to `/expenses/new`.
- Preserve filters/date range/search/status behavior.
- Make expense purpose/requested_by/multi-item details scannable.

Acceptance:
- Expenses list remains usable with dense rows.
- Mobile layout does not hide key amount/date/status info.

### Task 2.10: Unify pagination

Files:
- Modify: `src/components/pagination.tsx`

Requirements:
- Style matches dashboard shell.
- Works inside all registries.
- Preserve current query params.

Day 2 acceptance criteria:
- Projects, Payments, Expenses list pages redesigned.
- Existing filtering/sorting/pagination behavior preserved.
- Tables usable on desktop and mobile.
- Lint/typecheck pass or known pre-existing failures remain documented.

---

## Day 3: Forms, Detail Pages, Dashboard Content

Purpose: make create/edit/detail flows feel like one system, then polish the analytics dashboard.

### Phase 3A: Forms

### Task 3.1: Create form layout primitives

Objective: standardize new/edit pages.

Files:
- Create: `src/components/forms/form-shell.tsx`
- Create: `src/components/forms/form-section.tsx`
- Create: `src/components/forms/field-row.tsx` if useful.

Requirements:
- Section cards with titles/descriptions.
- Consistent label/input/select/textarea styles.
- Sticky or clearly placed submit actions on long forms.
- Error/help text styling if current forms expose errors.

### Task 3.2: Redesign Project new/edit forms

Files:
- Modify: `src/app/projects/new/page.tsx`
- Modify: `src/app/projects/[id]/edit/page.tsx`

Requirements:
- Group fields logically:
  - Identity: project number, name/type/status, batch info
  - Location/supervision: supervisor, address
  - Financial: budget, area/size/tank info if present
  - Metadata/actions
- Preserve existing form field names and server action compatibility.
- Keep default current batch year behavior.

Acceptance:
- Creating/editing project still works.
- Arabic fields readable.

### Task 3.3: Redesign Payment new/edit forms

Files:
- Modify: `src/app/payments/new/page.tsx`
- Modify: `src/app/payments/[id]/edit/page.tsx`
- Modify if needed: `src/components/payments/multiple-project-payment-items.tsx`

Requirements:
- Preserve multi-project payment allocation behavior.
- Shared check/voucher/date fields should feel like the form header.
- Line items should be clearly separated and total amount visible.
- Long project selector/search must remain usable.

Acceptance:
- Multi-project allocation still submits with correct repeated field names.
- Edit route still loads existing data.

### Task 3.4: Redesign Expense new/edit forms

Files:
- Modify: `src/app/expenses/new/page.tsx`
- Modify: `src/app/expenses/[id]/edit/page.tsx`
- Modify if needed: `src/components/expenses/multiple-expense-items.tsx`

Requirements:
- Preserve multi-expense item behavior.
- Shared metadata should be visually separate from line items.
- Totals and requested_by/purpose fields should be easy to scan.

Acceptance:
- New and edit expense flows still submit correctly.

### Phase 3B: Details and dashboard

### Task 3.5: Redesign Project detail page

Files:
- Modify: `src/app/projects/[id]/page.tsx`

Requirements:
- Strong header with project number, status badge, edit action.
- Summary cards: budget, released, expenses, balance if data exists.
- Details grouped into clear sections.
- Related payment/expense records, if currently displayed, use consistent table/list styling.

Acceptance:
- All existing detail data remains visible.

### Task 3.6: Redesign Dashboard page

Files:
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/components/dashboard/dashboard-charts.tsx`

Requirements:
- Use new page header.
- Metric cards use shared `MetricCard` styling.
- Charts sit in clean surfaces with titles and descriptions.
- Quick links either become action cards or are removed if sidebar/actions make them redundant.
- Sign out should not be an awkward page-level button if top bar already handles it.

Acceptance:
- Dashboard loads existing stats and chart data.
- Recharts remain responsive.
- Loading fallback matches visual system.

Day 3 acceptance criteria:
- Forms look coherent and remain functional.
- Project detail page redesigned.
- Dashboard page redesigned.
- No backend behavior intentionally changed.

---

## Day 4: Auth, Empty States, Polish, Verification

Purpose: close gaps, test on realistic viewport sizes, and ship a stable frontend redesign.

### Task 4.1: Redesign auth and system states

Files:
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/unauthorized.tsx`
- Modify: `src/app/error.tsx`
- Modify: `src/app/not-found.tsx`
- Modify: `src/app/loading.tsx`
- Modify: `src/components/flash-message.tsx`

Requirements:
- Login page should not show full app sidebar unless intentionally desired.
- Error/not-found/unauthorized states use consistent card/surface style.
- Loading uses skeletons or calm progress indicators.
- Flash message fits dashboard aesthetic and dark mode.

Acceptance:
- Auth flow still works.
- Error pages do not look like default placeholders.

### Task 4.2: Mobile pass

Objective: ensure the redesign is not desktop-only theater.

Viewport checks:
- 390x844 mobile
- 768x1024 tablet
- 1366x768 laptop
- 1920x1080 desktop

Routes to check:
- `/dashboard`
- `/projects`
- `/projects/new`
- `/projects/[id]` for a real ID
- `/payments`
- `/payments/new`
- `/expenses`
- `/expenses/new`
- `/login`

Requirements:
- Sidebar hidden or converted to sheet/bottom nav on mobile.
- Tables scroll horizontally or convert cleanly.
- Primary actions remain reachable.
- Filter controls remain usable.
- No content hidden under mobile nav.

### Task 4.3: Dark mode pass

Objective: remove visual regressions from current compatibility-layer dark mode.

Check:
- Body background
- Sidebar
- Top bar
- Cards/surfaces
- Inputs/selects/textareas
- Tables/sticky headers
- Badges
- Charts
- Flash messages

Acceptance:
- No white-on-white or black-on-black text.
- Borders visible but not harsh.
- Charts readable.

### Task 4.4: Accessibility and interaction pass

Checklist:
- Sidebar collapse button has `aria-label`.
- Mobile nav trigger has `aria-label`.
- Current nav link uses `aria-current="page"`.
- Form labels have matching inputs.
- Buttons are real `button` or `Link` as appropriate.
- Focus rings visible.
- Interactive controls remain keyboard reachable.
- Destructive actions, if any, remain clearly identified.

### Task 4.5: Final verification commands

Run:
```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Expected:
- All pass.

If failures occur:
- Fix redesign-caused failures.
- If a failure existed before the redesign, document it clearly with the original baseline evidence.

### Task 4.6: Final diff review

Run:
```bash
git diff --stat
git diff -- src/app src/components src/lib package.json package-lock.json pnpm-lock.yaml yarn.lock
```

Review for:
- Accidental backend/schema changes.
- Unrelated edits.
- Large duplicated class strings that should be shared.
- Overly clever client components.
- Routes accidentally moved/broken.

Day 4 acceptance criteria:
- Full frontend redesign complete.
- Verification commands pass.
- Remaining risks/open questions documented.
- Ready for user review.

---

## Files Likely to Change

High confidence:
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/components/app-nav.tsx`
- `src/components/theme-toggle.tsx`
- `src/components/breadcrumbs.tsx`
- `src/components/flash-message.tsx`
- `src/components/pagination.tsx`
- `src/app/dashboard/page.tsx`
- `src/components/dashboard/dashboard-charts.tsx`
- `src/app/projects/page.tsx`
- `src/components/projects/projects-table.tsx`
- `src/app/projects/[id]/page.tsx`
- `src/app/projects/new/page.tsx`
- `src/app/projects/[id]/edit/page.tsx`
- `src/app/payments/page.tsx`
- `src/components/payments/payments-table.tsx`
- `src/app/payments/new/page.tsx`
- `src/app/payments/[id]/edit/page.tsx`
- `src/components/payments/multiple-project-payment-items.tsx`
- `src/app/expenses/page.tsx`
- `src/components/expenses/expense-row.tsx`
- `src/app/expenses/new/page.tsx`
- `src/app/expenses/[id]/edit/page.tsx`
- `src/components/expenses/multiple-expense-items.tsx`
- `src/app/login/page.tsx`
- `src/app/loading.tsx`
- `src/app/error.tsx`
- `src/app/not-found.tsx`
- `src/app/unauthorized.tsx`

Likely new files:
- `src/components/layout/dashboard-shell.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/layout/top-bar.tsx`
- `src/components/layout/nav-items.ts`
- `src/components/layout/page-header.tsx`
- `src/components/ui/surface.tsx`
- `src/components/ui/status-badge.tsx`
- `src/components/ui/metric-card.tsx`
- `src/components/ui/empty-state.tsx`
- `src/components/forms/form-shell.tsx`
- `src/components/forms/form-section.tsx`
- `src/lib/utils/cn.ts` if no equivalent exists

Optional new files if using shadcn:
- `components.json`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/ui/separator.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/table.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/alert.tsx`
- `src/components/ui/tooltip.tsx`

---

## Implementation Rules

1. Do shell first. Do not start by polishing random pages.
2. Keep route behavior unchanged unless there is a deliberate reason.
3. Prefer shared primitives over repeated long class strings.
4. Keep server components server-side. Only introduce `use client` for state, pathname, localStorage, mobile drawer, or interactive widgets.
5. Do not move routes into route groups unless the auth/app-shell split demands it.
6. Preserve all form field names unless updating the matching server action intentionally.
7. Preserve query parameter names for filters/sorting/pagination.
8. Use one visual language across all pages.
9. Verify after each day, not only at the end.
10. If a design change creates functional uncertainty, choose stability over cleverness.

---

## Risk Register

Risk: Sidebar shell accidentally appears on login.
Mitigation: either use route groups or path-aware shell visibility.

Risk: Collapsible sidebar requires client state and causes hydration issues.
Mitigation: isolate collapse into a small client component; use safe default width until mounted.

Risk: shadcn init rewrites `globals.css` and breaks existing theme/font tokens.
Mitigation: inspect diff immediately after init; fix font declarations and theme variables before continuing.

Risk: Tables become pretty but less usable.
Mitigation: preserve dense rows, sticky headers, horizontal overflow, and sort/filter behavior.

Risk: Mobile navigation conflicts with fixed bottom nav/content padding.
Mitigation: test mobile viewport and add bottom padding only when mobile nav is present.

Risk: Arabic text becomes hard to read due to bold status/table styles.
Mitigation: add Arabic-specific normal-weight class and apply to supervisor/address/name cells where Arabic appears.

Risk: Backend behavior changes by accident.
Mitigation: avoid editing `src/lib/supabase/**`, server actions, schema, and query functions unless required by type errors.

---

## Suggested Commit Sequence

Only commit after user approval if that is the working convention.

1. `chore: baseline frontend redesign checks`
2. `feat: add dashboard shell and sidebar navigation`
3. `style: add shared dashboard UI primitives`
4. `style: redesign project registry`
5. `style: redesign payment registry`
6. `style: redesign expense registry`
7. `style: redesign create and edit forms`
8. `style: redesign dashboard and project detail pages`
9. `style: polish auth and system states`
10. `chore: verify frontend redesign`

---

## Final Review Checklist

- [ ] Desktop sidebar collapse works.
- [ ] Mobile nav works.
- [ ] Login does not show inappropriate app chrome.
- [ ] Projects list filters/sorts/paginates correctly.
- [ ] Payments list filters/paginates correctly.
- [ ] Expenses list filters/paginates correctly.
- [ ] New/edit project form submits.
- [ ] New/edit payment form submits, including multi-project allocations.
- [ ] New/edit expense form submits, including multiple items.
- [ ] Project detail page shows all important information.
- [ ] Dashboard charts render.
- [ ] Theme toggle works.
- [ ] Arabic text remains readable.
- [ ] Empty/loading/error states are styled.
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run test` passes.
- [ ] `npm run build` passes.

---

## Execution Recommendation

Use a phase-gated execution:

1. Implement Day 1 shell.
2. Stop and visually inspect core routes.
3. Implement Day 2 registries.
4. Stop and verify filters/tables.
5. Implement Day 3 forms/dashboard/detail.
6. Stop and verify submissions/build.
7. Implement Day 4 polish.
8. Final verification and review.

Do not attempt to redesign all pages in one blind sweep. That creates a beautiful mess. The shell-first approach gives control, then each page can be migrated safely.
