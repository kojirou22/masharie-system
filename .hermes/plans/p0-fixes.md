# P0 — Visual Bugs

## P0-1: Broken `var(--font-fira-code)` Reference

### Problem
Dashboard (`src/app/dashboard/page.tsx`), New Project (`src/app/projects/new/page.tsx`), New Expense (`src/app/expenses/new/page.tsx`), New Payment (`src/app/payments/new/page.tsx`), and Login (`src/app/login/page.tsx`) all use `font-[family-name:var(--font-fira-code)]` on `<h1>` headings. The layout only defines `--font-geist-sans` and `--font-geist-mono`, so this variable resolves to `nil` and browsers fall back to a generic serif font. Headings look wrong on every page.

### Option A: Add Fira Code (match the original intent)
1. In `src/app/layout.tsx`, import Fira Code from `next/font/google`:
   ```ts
   const firaCode = Fira_Code({
     variable: "--font-fira-code",
     subsets: ["latin"],
   });
   ```
2. Add `firaCode.variable` to the `<html>` className.
3. No component changes needed — existing `font-[family-name:var(--font-fira-code)]` references will work.

### Option B: Remove the reference and use Geist Mono instead
1. In each affected page, replace `font-[family-name:var(--font-fira-code)]` with `font-mono` (which maps to `--font-geist-mono` via Tailwind).
2. Affected files: `dashboard/page.tsx` (lines 16, 37), `projects/new/page.tsx` (line 64), `expenses/new/page.tsx` (line 56), `payments/new/page.tsx` (line 61), `login/page.tsx` (line 60).

### Recommendation
Option B. Geist Mono is already loaded, is a clean monospace font, and avoids adding another font weight to the bundle. The "M" logo mark already uses a bold geometric style so a monospace heading pairs well.

### Verification
- `npm run build` — no font-related warnings
- Open each page in browser — headings render in monospace consistently

---

## P0-2: `error.tsx` and `not-found.tsx` Use Hardcoded Hex Colors

### Problem
- `src/app/error.tsx`: uses `text-[#EF4444]` for the heading and `bg-[#2563EB]` / `bg-[#1D4ED8]` for the button.
- `src/app/not-found.tsx`: uses `text-[#2563EB]` for the link.

These colors are hardcoded Tailwind-style hex literals. They won't adapt when `[data-theme="dark"]` is active. In dark mode, the error heading and button will appear with light-mode-only colors against a dark background, reducing contrast.

### Fix
1. **`src/app/error.tsx`** — replace hex tokens with theme-aware classes:
   - `text-[#EF4444]` → `text-red-600` (Tailwind's red-600 is `#dc2626`, close to the destructive color)
   - `bg-[#2563EB]` → `bg-blue-600`
   - `hover:bg-[#1D4ED8]` → `hover:bg-blue-700`
   - Also add a wrapping `<main>` with padding and the `min-h-screen` background from the body so the error page doesn't float on an unstyled background.

2. **`src/app/not-found.tsx`** — replace `text-[#2563EB]` with `text-blue-600 hover:text-blue-700` so it inherits the blue accent properly and gets the dark-mode override via the existing `[data-theme="dark"] .text-blue-700` rule.

3. Optionally add a link back to `/dashboard` or home in addition to `/projects`.

### Verification
- `npm run build` — no errors
- Toggle dark mode — error page and not-found page colors adapt correctly
