import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function MetricCard({
  className,
  icon,
  label,
  value,
  tone = 'blue',
}: {
  label: string
  value: ReactNode
  icon?: ReactNode
  tone?: 'blue' | 'emerald' | 'amber' | 'slate'
  className?: string
}) {
  const toneClass = {
    blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    slate: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
  }[tone]

  return (
    <div className={cn('rounded-2xl border border-border/80 bg-card p-5 shadow-sm', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="mt-2 truncate text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </div>
        </div>
        {icon && <div className={cn('rounded-2xl p-2.5', toneClass)}>{icon}</div>}
      </div>
    </div>
  )
}
