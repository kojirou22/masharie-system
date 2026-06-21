# P3 — Polish & Minor Improvements

## P3-1: Table Row Click Affordance

### Problem
Projects table rows and payments table rows are clickable (open drawer / navigate to project), but the only visual hint is `cursor: pointer` and a hover background color. Users may not discover this interaction.

### Steps

#### 1. Add a visual indicator on hover
In `projects-table.tsx` and `payments-table.tsx`, add a chevron icon that appears on row hover:

```tsx
// Inside the <td> for the last cell:
<td className="px-4 py-3 text-right font-medium">
  <span className="inline-flex items-center gap-1">
    {formatPHP(project.total_released)}
    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity" />
  </span>
</td>
```

Add `group` class to the `<tr>` and import `ChevronRight` from `lucide-react`.

#### 2. Add a subtle instruction hint
In the existing mobile swipe hint div, add a desktop hint:
```tsx
<div className="border-b border-blue-100 bg-blue-50/60 px-4 py-2 text-xs font-medium text-blue-700 hidden sm:block">
  Click a row to view project details
</div>
```

### Verification
- Hover over a project row → chevron fades in
- Dark mode → chevron color adapts via the `text-current` inheritance
- Mobile → existing swipe hint still shows

---

## P3-2: Pagination with Page Numbers

### Problem
All three list pages (projects, expenses, payments) use Previous/Next-only pagination. For large datasets, users can't jump to a specific page.

### Steps

#### 1. Create `src/components/pagination.tsx`
A shared pagination component:
```tsx
type PaginationProps = {
  currentPage: number
  totalPages: number
  buildHref: (page: number) => string
}

export function Pagination({ currentPage, totalPages, buildHref }: PaginationProps) {
  // Show: 1 ... 4 5 [6] 7 8 ... 20
  // With a window of 2 pages on each side of current
  const pages = computePageWindow(currentPage, totalPages, windowSize = 2)

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      {currentPage > 1 && (
        <Link href={buildHref(currentPage - 1)}>Previous</Link>
      )}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-slate-400">…</span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={p === currentPage ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'}
          >
            {p}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link href={buildHref(currentPage + 1)}>Next</Link>
      )}
    </nav>
  )
}
```

#### 2. Style
- Active page: `bg-blue-600 text-white rounded-lg`
- Inactive: `border border-blue-200 bg-white text-blue-700 rounded-lg hover:bg-blue-50`
- Ellipsis: non-clickable `text-slate-400`
- Size: `h-9 w-9` for number buttons, slightly wider for Previous/Next

#### 3. Update all three list pages
Replace the existing Previous/Next block with `<Pagination currentPage={page} totalPages={totalPages} buildHref={pageHref} />`.

### Verification
- Navigate to a page with > 5 pages of data → page numbers appear
- Current page is highlighted
- Ellipsis appears for large page counts
- Dark mode → active/inactive states adapt

---

## P3-3: Confirmation on Form Submissions

### Problem
Creating a project, expense, or payment has no confirmation step. Accidental submissions can't be undone from the UI.

### Approach
Add a client-side confirmation dialog that appears when the user clicks the submit button. This is a lightweight approach that doesn't require server-side changes.

### Steps

#### 1. Create `src/components/confirm-button.tsx`
A wrapper around the submit button that shows a confirmation modal:

```tsx
'use client'

import { useState } from 'react'

export function ConfirmButton({
  children,
  confirmText = 'Are you sure you want to submit?',
  className,
}: {
  children: React.ReactNode
  confirmText?: string
  className?: string
}) {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className={className}
      >
        {children}
      </button>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-[2px]">
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-xl max-w-sm mx-4">
            <p className="text-sm font-medium text-slate-950 mb-4">{confirmText}</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="the-form-id"
                onClick={() => setShowConfirm(false)}
                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

#### 2. Add to each form page
- Give the `<form>` an `id`
- Replace the submit `<button type="submit">` with `<ConfirmButton form="the-form-id">`

#### 3. Dark mode for the modal
- Backdrop: already uses `bg-slate-950/45` — fine
- Modal card: `bg-white` → add `[data-theme="dark"]` override to `bg-slate-800 border-slate-700`
- Text: `text-slate-950` → dark mode override to `text-slate-100`

### Verification
- Click "Create Project" → confirmation modal appears
- Click Cancel → modal closes, form not submitted
- Click Confirm → form submits normally
- Dark mode → modal adapts

---

## P3-4: Remove Unused `cn()` Utility

### Problem
`src/lib/utils/cn.ts` exports a `clsx` + `twMerge` helper but is never imported anywhere in the codebase. It's dead code that adds confusion — future developers might import it thinking it's the project's standard, or wonder why it exists.

### Decision
**Option A**: Delete it. If conditional class composition is needed, use template literals or inline `clsx` calls directly. The project's style doesn't use complex conditional classes often enough to need a shared utility.

**Option B**: Keep it and start using it. Replace verbose template literal class strings with `cn()` calls. This is the shadcn/ui convention and makes conditional classes more readable.

**Recommendation**: Option A for now. The project doesn't have complex conditional styling patterns. If that changes later, re-add it.

### Steps
1. Delete `src/lib/utils/cn.ts`
2. Run `npm run build` to confirm nothing breaks

---

## P3-5: Mobile Bottom Nav Contrast

### Problem
The mobile bottom nav (`MobileBottomNav` in `app-nav.tsx`) uses `text-slate-500` for inactive items against a `bg-white/90` background. In bright environments or on older screens, this can be hard to read.

### Steps
1. Change inactive item color from `text-slate-500` to `text-slate-600` for better contrast
2. Add a dark mode override: `[data-theme="dark"]` inactive items → `text-slate-400`
3. Consider adding a slight text-shadow or increasing the icon size from `h-5 w-5` to `h-6 w-6` for better tap-target visibility

### Verification
- View on mobile or mobile emulation → inactive items are clearly visible
- Dark mode → inactive items use lighter color for contrast against dark background
