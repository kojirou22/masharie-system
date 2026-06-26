'use client'

import { Moon, Sun } from 'lucide-react'
import { useSyncExternalStore } from 'react'

import { Button } from '@/components/ui/button'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'masharie-theme'
const THEME_CHANGE_EVENT = 'masharie-theme-change'

function getPreferredTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY)
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange)
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange)

  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange)
  }
}

function getServerSnapshot(): Theme {
  return 'light'
}

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
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="gap-2"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      suppressHydrationWarning
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="relative size-4" aria-hidden="true">
        <Sun
          className={`absolute inset-0 size-4 transition-all ${
            isDark ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
          }`}
        />
        <Moon
          className={`absolute inset-0 size-4 transition-all ${
            isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'
          }`}
        />
      </span>
      <span className="hidden sm:inline" suppressHydrationWarning>
        {isDark ? 'Dark' : 'Light'}
      </span>
    </Button>
  )
}
