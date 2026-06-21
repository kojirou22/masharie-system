# P4 — Enhancements & Nice-to-Haves

## P4-1: Dashboard Stat Card Enhancements

### Problem
The 4 stat cards on the dashboard are plain number + label. They lack visual hierarchy, making it harder to scan quickly.

### Steps

#### 1. Add icons to each card
Use lucide-react icons that match each metric:
- Total Projects: `Landmark`
- Active Projects: `Activity` (or `PlayCircle`)
- Total Budget: `Wallet`
- Total Released: `Banknote`

Place the icon in the top-right corner of each card, semi-transparent, as a decorative element.

#### 2. Add a subtle accent bar
A 3px colored bar at the top of each card:
- Total Projects: blue
- Active Projects: green
- Total Budget: indigo
- Total Released: emerald

```tsx
<div className={`rounded-t-2xl h-1 ${colorClass}`} />
```

#### 3. Layout tweak
Slightly increase padding from `p-5` to `p-6` for breathing room.

### Verification
- Dashboard loads → icons and accent bars appear
- Dark mode → icon colors adapt
- Mobile → cards stack cleanly with new padding

---

## P4-2: SelectField Placeholder Logic

### Problem
`SelectField` in all form pages renders `<option value="">Select...</option>` even when the field is `required`. This means a user can submit the form with the placeholder selected, which will trigger a Zod validation error — but the error message won't tell them which field failed.

### Steps

#### 1. Update `SelectField` component signature
Add a `placeholder` prop (default: "Select...") and hide the placeholder option when the field is required:

```tsx
function SelectField({ name, label, options, defaultValue, required = false, placeholder = "Select..." }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-blue-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue || ""}
        className="..."
      >
        {!required && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}
```

#### 2. When required is true
The first `<option>` in the dropdown will be the first real option (e.g., "Mosque"). The user must pick something. The browser's native `required` validation will prevent submission with an empty value.

#### 3. When required is false
The "Select..." placeholder appears as expected.

### Verification
- Open a required select (e.g., Type on New Project) → no "Select..." option
- Open an optional select → "Select..." option appears
- Try submitting with no selection on a required field → browser validation fires

---

## P4-3: ThemeToggle Touch Handling

### Problem
`ThemeToggle` uses a `handledTouchRef` pattern to prevent double-firing on touch devices (touch events fire both `onTouchEnd` and `onClick`). This is a known workaround but is fragile — if a browser changes event ordering, the toggle could break.

### Steps

#### 1. Simplify to pointer events
Replace the `onClick` + `onTouchEnd` pattern with a single `onClick` handler and use CSS `touch-action: manipulation` (already applied via the `touch-manipulation` class) to eliminate touch delay:

```tsx
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getPreferredTheme, getServerSnapshot)

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    applyTheme(nextTheme)
    window.localStorage.setItem(STORAGE_KEY, nextTheme)
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="... touch-manipulation"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      suppressHydrationWarning
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      ...
    </button>
  )
}
```

#### 2. Remove the `handledTouchRef` import and all `onTouchEnd` logic.

#### 3. Ensure `touch-action: manipulation` is applied
Already present via the `touch-manipulation` class. This removes the 300ms tap delay on mobile browsers, making `onClick` feel instant.

### Verification
- Toggle theme on desktop → works
- Toggle theme on mobile emulation → works (single toggle, no double-fire)
- `npm run build` — no errors
