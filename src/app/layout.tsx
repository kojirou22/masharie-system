import Link from 'next/link'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppNav, MobileBottomNav } from '@/components/app-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Masharie System",
  description: "Project, payment, expense, and dashboard charts for community development work.",
};

const themeInitScript = `
(() => {
  try {
    const storageKey = 'masharie-theme';
    const storedTheme = window.localStorage.getItem(storageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : prefersDark ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {
    document.documentElement.dataset.theme = 'light';
    document.documentElement.style.colorScheme = 'light';
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full pb-24 text-slate-950 sm:pb-0">
        <Link
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-blue-700 focus:shadow-lg"
        >
          Skip to content
        </Link>
        <header className="sticky top-0 z-40 border-b border-blue-100/80 bg-white/85 shadow-sm shadow-blue-100/40 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:py-3">
            <Link href="/" className="group flex w-fit items-center gap-3 rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Masharie home">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white shadow-sm shadow-blue-200 group-hover:bg-blue-700 sm:h-10 sm:w-10">
                M
              </span>
              <span>
                <span className="block text-sm font-bold tracking-tight text-slate-950">Masharie System</span>
                <span className="hidden text-xs text-slate-500 sm:block">Projects · Payments · Expenses</span>
              </span>
            </Link>
            <div className="hidden min-w-0 items-center gap-2 overflow-x-auto pb-1 sm:flex sm:pb-0">
              <AppNav />
            </div>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main id="main-content" className="min-h-[calc(100vh-73px)]">
          {children}
        </main>
        <MobileBottomNav />
      </body>
    </html>
  );
}
