import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function Surface({
  className,
  ...props
}: React.ComponentProps<'section'>) {
  return (
    <section
      className={cn('rounded-2xl border border-border/80 bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  )
}

export function SurfaceHeader({
  actions,
  className,
  description,
  title,
}: {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-3 border-b border-border/80 p-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
