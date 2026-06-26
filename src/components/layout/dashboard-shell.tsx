'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react'
import { useMemo, useSyncExternalStore } from 'react'

import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { isActivePath, primaryNavItems, quickActionItems, type NavItem } from './nav-items'

const COLLAPSED_STORAGE_KEY = 'masharie-sidebar-collapsed'
const SIDEBAR_CHANGE_EVENT = 'masharie-sidebar-change'
const AUTH_ROUTES = ['/login', '/logout', '/unauthorized']

function subscribeToSidebar(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange)
  window.addEventListener(SIDEBAR_CHANGE_EVENT, onStoreChange)

  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(SIDEBAR_CHANGE_EVENT, onStoreChange)
  }
}

function getSidebarSnapshot() {
  return window.localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true'
}

function getSidebarServerSnapshot() {
  return false
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  if (isAuthRoute) {
    return <main id="main-content" className="min-h-screen">{children}</main>
  }

  return <DashboardFrame pathname={pathname}>{children}</DashboardFrame>
}

function DashboardFrame({
  children,
  pathname,
}: {
  children: React.ReactNode
  pathname: string
}) {
  const sidebarCollapsed = useSyncExternalStore(
    subscribeToSidebar,
    getSidebarSnapshot,
    getSidebarServerSnapshot
  )

  function toggleCollapsed() {
    const next = !getSidebarSnapshot()
    window.localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next))
    window.dispatchEvent(new Event(SIDEBAR_CHANGE_EVENT))
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DesktopSidebar
        collapsed={sidebarCollapsed}
        pathname={pathname}
        onToggle={toggleCollapsed}
      />
      <div
        className={cn(
          'flex min-h-screen flex-col transition-[padding] duration-200 ease-out lg:pl-72',
          sidebarCollapsed && 'lg:pl-[5.25rem]'
        )}
      >
        <TopBar pathname={pathname} />
        <main id="main-content" className="flex-1 px-4 py-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}

function DesktopSidebar({
  collapsed,
  pathname,
  onToggle,
}: {
  collapsed: boolean
  pathname: string
  onToggle: () => void
}) {
  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden border-r border-border/80 bg-sidebar/95 shadow-sm backdrop-blur-xl transition-[width] duration-200 ease-out lg:flex lg:flex-col',
        collapsed ? 'w-[5.25rem]' : 'w-72'
      )}
      aria-label="Primary sidebar"
    >
      <div className="flex h-16 items-center gap-3 px-4">
        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Masharie dashboard"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-black text-primary-foreground shadow-sm">
            M
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
                Masharie System
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                Projects · Payments · Expenses
              </span>
            </span>
          )}
        </Link>
      </div>

      <Separator />

      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <NavSection
          collapsed={collapsed}
          items={primaryNavItems}
          pathname={pathname}
          title="Operations"
        />
        <NavSection
          collapsed={collapsed}
          items={quickActionItems}
          pathname={pathname}
          title="Create"
        />
      </div>

      <div className="border-t border-border/80 p-3">
        <Button
          type="button"
          variant="ghost"
          size={collapsed ? 'icon' : 'lg'}
          className={cn('w-full justify-start', collapsed && 'justify-center')}
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
          {!collapsed && <span>Collapse</span>}
        </Button>
      </div>
    </aside>
  )
}

function NavSection({
  collapsed,
  items,
  pathname,
  title,
}: {
  collapsed: boolean
  items: NavItem[]
  pathname: string
  title: string
}) {
  return (
    <div>
      {!collapsed && (
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </p>
      )}
      <nav className="grid gap-1" aria-label={title}>
        {items.map((item) => (
          <NavLink key={item.href} collapsed={collapsed} item={item} pathname={pathname} />
        ))}
      </nav>
    </div>
  )
}

function NavLink({
  collapsed,
  item,
  pathname,
}: {
  collapsed: boolean
  item: NavItem
  pathname: string
}) {
  const active = isActivePath(pathname, item.href)
  const Icon = item.icon
  const link = (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 outline-none transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-ring',
        active && 'bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground',
        collapsed && 'justify-center px-0'
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  )

  if (!collapsed) {
    return link
  }

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  )
}

function TopBar({ pathname }: { pathname: string }) {
  const title = useMemo(() => getRouteTitle(pathname), [pathname])

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <MobileNav pathname={pathname} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{title}</p>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              Community project operations dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form action="/api/auth/signout" method="POST" className="hidden sm:block">
            <Button type="submit" variant="outline" size="lg">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}

function MobileNav({ pathname }: { pathname: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="lg:hidden" size="icon-lg" variant="outline" aria-label="Open navigation">
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[20rem] p-0">
        <SheetHeader className="border-b border-border p-4 text-left">
          <SheetTitle>Masharie System</SheetTitle>
          <SheetDescription>Projects, payments, and expenses</SheetDescription>
        </SheetHeader>
        <div className="space-y-6 p-4">
          <MobileNavSection items={primaryNavItems} pathname={pathname} title="Operations" />
          <MobileNavSection items={quickActionItems} pathname={pathname} title="Create" />
          <form action="/api/auth/signout" method="POST">
            <Button type="submit" variant="outline" size="lg" className="w-full">
              Sign out
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function MobileNavSection({
  items,
  pathname,
  title,
}: {
  items: NavItem[]
  pathname: string
  title: string
}) {
  return (
    <div>
      <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </p>
      <nav className="grid gap-1" aria-label={`Mobile ${title}`}>
        {items.map((item) => {
          const Icon = item.icon
          const active = isActivePath(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground',
                active && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

function getRouteTitle(pathname: string) {
  if (pathname === '/') return 'Home'
  if (pathname.startsWith('/dashboard')) return 'Dashboard'
  if (pathname.startsWith('/projects/new')) return 'New Project'
  if (pathname.startsWith('/projects')) return 'Projects'
  if (pathname.startsWith('/payments/new')) return 'New Payment Release'
  if (pathname.startsWith('/payments')) return 'Payments'
  if (pathname.startsWith('/expenses/new')) return 'New Expense'
  if (pathname.startsWith('/expenses')) return 'Expenses'

  return 'Masharie System'
}
