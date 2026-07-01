import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function PageHeader({
  actions,
  badge,
  children,
  className,
  description,
  eyebrow,
  title,
}: {
  title: string
  description?: string
  eyebrow?: string
  badge?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'mb-4 rounded-3xl border border-border/80 bg-card/95 p-4 shadow-sm backdrop-blur sm:p-5',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 lg:items-start">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-3 sm:mt-4">{children}</div>}
    </section>
  )
}
