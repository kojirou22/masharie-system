import type { LucideIcon } from 'lucide-react'
import { BarChart3, FileText, HandCoins, Landmark, PlusCircle } from 'lucide-react'

export type NavItem = {
  href: string
  label: string
  description?: string
  icon: LucideIcon
}

export const primaryNavItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    description: 'KPIs and charts',
    icon: BarChart3,
  },
  {
    href: '/projects',
    label: 'Projects',
    description: 'Project registry',
    icon: Landmark,
  },
  {
    href: '/payments',
    label: 'Payments',
    description: 'Released payments',
    icon: HandCoins,
  },
  {
    href: '/expenses',
    label: 'Expenses',
    description: 'Operational expenses',
    icon: FileText,
  },
]

export const quickActionItems: NavItem[] = [
  {
    href: '/projects/new',
    label: 'New Project',
    description: 'Create project record',
    icon: PlusCircle,
  },
]

export function isActivePath(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/'
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}
