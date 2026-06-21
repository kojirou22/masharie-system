'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, FileText, HandCoins, Landmark } from 'lucide-react'

const navItems = [
  { href: '/projects', label: 'Projects', icon: Landmark },
  { href: '/payments', label: 'Payments', icon: HandCoins },
  { href: '/expenses', label: 'Expenses', icon: FileText },
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <nav
      className="flex min-w-0 gap-1 overflow-x-auto rounded-full border border-blue-100 bg-slate-50/80 p-1 text-sm shadow-inner shadow-blue-50/60"
      aria-label="Primary navigation"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`whitespace-nowrap rounded-full px-3.5 py-2 font-semibold transition-all focus-visible:ring-2 focus-visible:ring-blue-500 ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 hover:bg-blue-700'
                : 'text-slate-600 hover:bg-white hover:text-blue-700 hover:shadow-sm focus-visible:bg-white focus-visible:text-blue-700'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="pointer-events-none fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 gap-1 rounded-3xl border border-blue-100 bg-white/90 p-1.5 shadow-2xl shadow-slate-950/20 backdrop-blur-xl sm:hidden"
      aria-label="Mobile primary navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`pointer-events-auto flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition-all focus-visible:ring-2 focus-visible:ring-blue-500 ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
