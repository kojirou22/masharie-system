import type { ReactNode } from 'react'

import { PageHeader } from '@/components/layout/page-header'
import { cn } from '@/lib/utils'

export function RegistryPageShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('mx-auto max-w-7xl px-0 py-3 sm:py-5', className)}>{children}</div>
}

export function RegistryHeader({
  actions,
  children,
  description,
  eyebrow,
  stats,
  title,
}: {
  title: string
  description?: string
  eyebrow?: string
  stats?: ReactNode
  actions?: ReactNode
  children?: ReactNode
}) {
  return (
    <PageHeader
      eyebrow={eyebrow}
      title={title}
      description={description}
      actions={
        (stats || actions) && (
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {stats}
            {actions}
          </div>
        )
      }
      className="relative z-30"
    >
      {children && <RegistryFilterPanel>{children}</RegistryFilterPanel>}
    </PageHeader>
  )
}

export function RegistryFilterPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('border-t border-border/70 pt-4', className)}>
      {children}
    </div>
  )
}

export function RegistryStatBadge({
  children,
  tone = 'blue',
}: {
  children: ReactNode
  tone?: 'blue' | 'emerald' | 'rose' | 'slate'
}) {
  const tones = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
    emerald:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    rose: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
    slate: 'border-border bg-muted text-muted-foreground',
  }

  return (
    <span className={cn('inline-flex w-fit items-center rounded-full border px-3 py-1 text-sm font-medium', tones[tone])}>
      {children}
    </span>
  )
}

export const registryFilterGridClass =
  'grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(360px,1fr)_repeat(4,auto)] lg:items-end'

export const registryLabelClass = 'mb-1 block text-xs font-medium text-muted-foreground'

export const registryInputClass =
  'h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50'

export const registrySelectClass =
  'h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50'
