# P1 — High-Impact UX Issues

## P1-1: Form Errors Passed via URL Query Params

### Problem
All form pages (`/projects/new`, `/expenses/new`, `/payments/new`, `/login`) pass validation/server errors as `?error=...` in the URL via `redirect(`/page?error=${encodeURIComponent(msg)}`)`. This causes:
- **Persistence on refresh**: the error message reappears on every reload until the user navigates away
- **URL ugliness**: encoded error strings clutter the address bar
- **Truncation risk**: very long validation messages may exceed URL length limits
- **No structured data**: a single flat string means multiple field errors can't be displayed inline
- **Accessibility**: screen readers announce the URL, not the error

### Approach: Flash Cookie Pattern
Next.js supports `cookies()` for server-side flash messages. The pattern:
1. On form failure, set a cookie with the error message (encrypted by Supabase session)
2. Redirect to the same page without query params
3. On page load, read the cookie, render the error, and immediately delete it

### Steps

#### Shared utility: `src/lib/flash.ts`
```ts
import { cookies } from 'next/headers'

const FLASH_COOKIE = 'flash_message'

export async function getFlash(): Promise<string | null> {
  const store = await cookies()
  const value = store.get(FLASH_COOKIE)?.value ?? null
  store.delete(FLASH_COOKIE)
  return value
}

export async function setFlash(message: string) {
  const store = await cookies()
  store.set(FLASH_COOKIE, message, {
    path: '/',
    maxAge: 10, // seconds — just long enough for one read
    httpOnly: true,
    sameSite: 'lax',
  })
}
```

#### Update each form page
For each of `projects/new/page.tsx`, `expenses/new/page.tsx`, `payments/new/page.tsx`, `login/page.tsx`:
1. Import `getFlash` and `setFlash`
2. Replace `const error = typeof params.error === 'string' ? params.error : ''` with `const error = await getFlash() ?? ''`
3. In the form action, replace `redirect(\`/page?error=${encodeURIComponent(msg)}\`)` with:
   ```ts
   await setFlash(msg)
   redirect('/page')
   ```
4. Remove all `decodeURIComponent(error)` calls (no longer encoded)
5. Clean up redirect URL params that referenced `error` in `login/page.tsx`

#### Supabase error messages
Supabase postgres errors can be very long ("duplicate key value violates unique constraint..."). Consider mapping them to friendly messages:
- Unique constraint violation → "A record with this value already exists"
- Foreign key violation → "The selected project does not exist"
- Check constraint → "A provided value is out of the allowed range"

### Verification
- Submit a form with invalid data → error appears once, disappears on refresh
- Submit with valid data → no error, normal redirect
- `npm run build` — no errors

---

## P1-2: No Success Feedback After Form Submissions

### Problem
After successfully creating a project, expense, or payment, the user is redirected back to the list page with no confirmation that their action worked. This is disorienting — especially since the redirect looks identical to a casual navigation.

### Approach: Flash Cookie Pattern (same infrastructure as P1-1)
Add a second flash cookie for success messages, or extend the flash utility to support `{ type: 'error' | 'success', message: string }` (JSON-serialized in the cookie).

### Steps

#### Extend `src/lib/flash.ts`
```ts
type Flash = { type: 'error' | 'success'; message: string }

export async function getFlash(): Promise<Flash | null> {
  const store = await cookies()
  const raw = store.get(FLASH_COOKIE)?.value
  store.delete(FLASH_COOKIE)
  if (!raw) return null
  try { return JSON.parse(raw) as Flash } catch { return null }
}

export async function setFlash(type: Flash['type'], message: string) {
  const store = await cookies()
  store.set(FLASH_COOKIE, JSON.stringify({ type, message }), {
    path: '/',
    maxAge: 10,
    httpOnly: true,
    sameSite: 'lax',
  })
}
```

#### Create `src/components/flash-message.tsx`
A client component that:
- Accepts a `flash` prop (the parsed Flash object)
- Renders a styled banner: green for success, red for error
- Auto-dismisses after 5 seconds via `setTimeout`
- Includes a close button
- Uses `role="alert"` for accessibility
- Animates in/out with the same 180ms easing used elsewhere

#### Update layout or each list page
Option A (simpler): Add the flash message to each list page individually — read the flash in the server component and pass it to `<FlashMessage />`.

Option B (cleaner): Create a `PageWrapper` client component that reads the flash from a client-side cookie read, but this adds complexity.

**Recommendation**: Option A. Each list page (`projects/page.tsx`, `expenses/page.tsx`, `payments/page.tsx`) already reads server data, so reading the flash there is natural.

#### Flash message styling
- Success: `bg-emerald-50 border border-emerald-200 text-emerald-800` with a checkmark icon
- Error: `bg-red-50 border border-red-200 text-red-700` with an alert icon
- Dark mode variants using the existing `[data-theme="dark"]` override classes
- Positioned at the top of the page content, below the header

### Verification
- Create a project → redirected to `/projects` with a green "Project created successfully" banner
- Banner auto-dismisses after 5 seconds or on close click
- Refresh the page → banner is gone (cookie consumed)
- Dark mode → colors adapt correctly

---

## P1-3: Chart Empty States

### Problem
`ReportCharts` in `src/components/reports/report-charts.tsx` renders three chart containers unconditionally. If `chartData.projectsByType`, `chartData.projectsByStatus`, or `chartData.budgetByType` are empty arrays, Recharts renders an empty SVG — a blank box with no axes, no labels, nothing. This looks broken.

### Steps

#### 1. Add empty state check to `ReportCharts`
Before rendering each chart, check if the data array has entries. If empty, render a placeholder:

```tsx
function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-500">
      <BarChart3 className="mb-2 h-8 w-8 opacity-40" />
      <p className="text-sm font-medium">No {label} data yet</p>
    </div>
  )
}
```

#### 2. Apply to each chart section
```tsx
{chartData.projectsByType.length > 0 ? (
  <ResponsiveContainer ...>
    <PieChart>...</PieChart>
  </ResponsiveContainer>
) : (
  <EmptyChart label="project type" />
)}
```

Same pattern for "status" and "budget" charts.

#### 3. Dark mode
- Empty state border: `border-slate-300` → add `[data-theme="dark"]` override to `border-slate-600`
- Text: `text-slate-500` → dark mode maps to `#94a3b8` via existing CSS

### Verification
- Mock empty chart data (or point Supabase to an empty/test project) → empty states render
- Dark mode → dashed border and text are visible
- `npm run build` — no errors
