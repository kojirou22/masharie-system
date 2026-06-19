import Link from 'next/link'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

const navItems = [
  { href: "/projects", label: "Projects" },
  { href: "/payments", label: "Payments" },
  { href: "/expenses", label: "Expenses" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full text-slate-950">
        <Link
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-blue-700 focus:shadow-lg"
        >
          Skip to content
        </Link>
        <header className="sticky top-0 z-40 border-b border-blue-100/80 bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="group flex items-center gap-3" aria-label="Masharie home">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white shadow-sm shadow-blue-200 group-hover:bg-blue-700">
                M
              </span>
              <span>
                <span className="block text-sm font-bold tracking-tight text-slate-950">Masharie System</span>
                <span className="block text-xs text-slate-500">Projects · Payments · Expenses</span>
              </span>
            </Link>
            <nav className="flex gap-1 overflow-x-auto rounded-full border border-blue-100 bg-slate-50/80 p-1 text-sm" aria-label="Primary navigation">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-full px-3 py-2 font-medium text-slate-600 hover:bg-white hover:text-blue-700 hover:shadow-sm focus-visible:bg-white focus-visible:text-blue-700"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main id="main-content" className="min-h-[calc(100vh-73px)]">
          {children}
        </main>
      </body>
    </html>
  );
}
