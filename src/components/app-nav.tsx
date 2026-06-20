'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/projects', label: 'Projects' },
  { href: '/payments', label: 'Payments' },
  { href: '/expenses', label: 'Expenses' },
  { href: '/dashboard', label: 'Dashboard' },
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
