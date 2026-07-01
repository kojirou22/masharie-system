import Link from 'next/link'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { DashboardShell } from '@/components/layout/dashboard-shell'
import { FlashMessage } from '@/components/flash-message'
import { TooltipProvider } from '@/components/ui/tooltip'
import { createClient } from '@/lib/supabase/server'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Masharie System',
  description:
    'Project, payment, expense, and dashboard charts for community development work.',
}

const themeInitScript = `
(() => {
  try {
    const storageKey = 'masharie-theme';
    const storedTheme = window.localStorage.getItem(storageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : prefersDark ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  } catch {
    document.documentElement.dataset.theme = 'light';
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }
})();
`

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full text-foreground">
        <TooltipProvider>
          <Link
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary focus:shadow-lg"
          >
            Skip to content
          </Link>
          <DashboardShell isAuthenticated={Boolean(user)}>{children}</DashboardShell>
          <FlashMessage />
        </TooltipProvider>
      </body>
    </html>
  )
}
