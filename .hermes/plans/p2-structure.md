# P2 — Structural & Consistency Improvements

## P2-1: Loading Skeletons

### Problem
`src/app/loading.tsx` renders a centered "Loading..." pulsing text. This is the Next.js default and provides no visual hint of what the page looks like. Users see a flash of blank space followed by content, which feels slow even if the data loads quickly.

### Approach
Create page-specific skeleton components that mirror the actual layout. Next.js streaming with `<Suspense>` boundaries already exists at the page level — the skeleton fills the Suspense fallback.

### Steps

#### 1. Create `src/components/skeletons/`
A folder for skeleton components, one per major page:

**`dashboard-skeleton.tsx`** — matches the dashboard layout:
- Title bar skeleton (two lines)
- 4 stat card skeletons in a grid (grey rectangles with pulse)
- Quick links section (4 boxes)
- 2 chart card skeletons (rectangles with placeholder circles for pie charts)

**`projects-skeleton.tsx`** — matches the projects page:
- Header area (title + count badge)
- Filter bar (input + 4 select fields)
- Table skeleton: header row + 5 data rows with grey pulse rectangles

**`expenses-skeleton.tsx`** and **`payments-skeleton.tsx`** — similar table-based pattern.

#### 2. Skeleton component style
Use Tailwind's `animate-pulse` with `bg-slate-200` (light) / `bg-slate-700` (dark) rounded rectangles. Match the dimensions of real content closely:

```tsx
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
}
```

Dark mode override: add `.dark .animate-pulse` bg-slate-700, or use the existing `[data-theme="dark"]` selector.

#### 3. Update `loading.tsx`
Replace the generic "Loading..." with a default skeleton, or use route-based logic:
```tsx
// Simple approach — one generic skeleton for all routes
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      <Skeleton className="mb-6 h-8 w-48" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-3xl" />
    </div>
  )
}
```

#### 4. Update page-level Suspense fallbacks
The existing `<Suspense fallback={...}>` blocks in page files can also be updated to use the skeleton components instead of bare "Loading..." text.

### Verification
- Navigate to any page with network throttling (Slow 3G in DevTools) — skeleton appears during loading
- Dark mode — skeleton blocks use appropriate dark background color
- No layout shift when real content replaces skeleton (CLS check in Lighthouse)

---

## P2-2: Extract Shared Project/Detail Components (Drawer + Page Duplication)

### Problem
- `src/components/projects/projects-table.tsx` (lines 262-401): `ProjectDetailsDrawer` with `InfoField`, progress bar, and payment releases table
- `src/app/projects/[id]/page.tsx` (lines 46-154): Nearly identical layout with its own `InfoField`, progress bar, and payment releases table

Any change to the project detail view (new field, layout tweak, style change) must be made in two places. This is a maintenance risk and a drift risk.

### Steps

#### 1. Create `src/components/projects/project-info-field.tsx`
Extract the `InfoField` component (identical in both locations) into a shared component:
```tsx
export function ProjectInfoField({ label, value, wide = false }: {
  label: string; value: string; wide?: boolean
}) { ... }
```

#### 2. Create `src/components/projects/funding-progress.tsx`
Extract the progress bar section:
- Props: `released`, `budget`, `remaining`, `progress`
- Includes the "released of budget" text and the progress bar
- Uses `formatPHP` for currency display

#### 3. Create `src/components/projects/payment-releases-table.tsx`
Extract the payment releases table:
- Props: `payments: PaymentReleases[]`
- Renders check #, voucher #, amount, status, date
- Empty state: "No payment releases yet."

#### 4. Create `src/components/projects/project-detail-card.tsx`
A section wrapper that composes the above:
- `ProjectHeader` — project number, address, status badge, type badge
- `ProjectInfoGrid` — name, donor, supervisor, batch, address, mosque-specific fields
- `FundingProgress` + `PaymentReleasesTable`

#### 5. Update consumers
- `projects-table.tsx` — replace inline drawer JSX with `<ProjectDetailCard project={selectedProject} />` + the drawer wrapper
- `projects/[id]/page.tsx` — replace inline page JSX with `<ProjectDetailCard project={project} />` wrapped in page layout

### Verification
- `npm run build` — no errors
- Open project drawer from table → renders correctly
- Open project detail page → renders identically to before
- Dark mode → both locations render correctly

---

## P2-3: Add Breadcrumb Navigation

### Problem
Pages like `/projects/[id]`, `/expenses/new`, `/payments/new` only have a "← Back" link. As the app grows, users lose context about where they are.

### Steps

#### 1. Create `src/components/breadcrumbs.tsx`
A shared component that accepts an array of breadcrumb items:
```tsx
type BreadcrumbItem = { label: string; href?: string }

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden="true" className="text-slate-400">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-blue-700">{item.label}</Link>
            ) : (
              <span className="font-medium text-slate-950">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

#### 2. Add to pages
- `/projects/[id]/page.tsx`: `[{ label: 'Projects', href: '/projects' }, { label: project.project_number }]`
- `/projects/[id]/edit/page.tsx`: `[{ label: 'Projects', href: '/projects' }, { label: project_number, href: '/projects/:id' }, { label: 'Edit' }]`
- `/projects/new/page.tsx`: `[{ label: 'Projects', href: '/projects' }, { label: 'New Project' }]`
- `/expenses/new/page.tsx`: `[{ label: 'Expenses', href: '/expenses' }, { label: 'New Expense' }]`
- `/payments/new/page.tsx`: `[{ label: 'Payments', href: '/payments' }, { label: 'New Payment' }]`

### Verification
- Navigate to each page — breadcrumbs appear, last item is not a link
- Dark mode — text colors adapt
- Mobile — breadcrumbs wrap cleanly

---

## P2-4: Charts Dark Mode Adaptation

### Problem
`ReportCharts` uses hardcoded hex colors (`#2563EB`, `#22C55E`, etc.) for bar fills and pie slice colors. The Recharts `<Tooltip />` uses default white background styling. In dark mode, the tooltip is a light box on a dark page, and some pie slice colors lose contrast.

### Steps

#### 1. Add CSS variable-based color chart palette
In `globals.css`, define chart color variables under both `:root` and `[data-theme="dark"]`:
```css
:root {
  --chart-1: #2563eb;
  --chart-2: #22c55e;
  --chart-3: #f59e0b;
  --chart-4: #ef4444;
  --chart-5: #3b82f6;
  --chart-6: #14b8a6;
  --chart-7: #f97316;
  --chart-8: #6366f1;
}

[data-theme="dark"] {
  --chart-1: #60a5fa;
  --chart-2: #4ade80;
  --chart-3: #fbbf24;
  --chart-4: #f87171;
  --chart-5: #93c5fd;
  --chart-6: #2dd4bf;
  --chart-7: #fb923c;
  --chart-8: #a5b4fc;
}
```

#### 2. Update `ReportCharts`
Replace the hardcoded `COLORS` array:
```tsx
const COLORS = [
  'var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)',
  'var(--chart-5)', 'var(--chart-6)', 'var(--chart-7)', 'var(--chart-8)',
]
```

Also update the bar chart's `<Bar fill="#2563EB">` → `<Bar fill="var(--chart-1)">`.

#### 3. Style the Tooltip
Add a custom `<Tooltip />` component or use the `content` prop to style it:
```tsx
<Tooltip
  contentStyle={{
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '0.75rem',
    color: 'var(--card-foreground)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  }}
/>
```

#### 4. Dark mode tooltip
Add a `[data-theme="dark"]` override in CSS for the tooltip wrapper if needed, or use a CSS variable for the box-shadow color.

### Verification
- View dashboard charts in light mode — colors unchanged from now
- Toggle dark mode — pie/bar colors brighten, tooltip matches dark theme
- `npm run build` — no errors
