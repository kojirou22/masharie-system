import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusTones: Record<string, string> = {
  Pending: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  'On Going': 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
  'On Hold': 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300',
  Completed: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  Cancelled: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
  Released: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  Paid: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
}

export function StatusBadge({
  className,
  status,
}: {
  status: string | null | undefined
  className?: string
}) {
  const label = status || 'Unknown'

  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusTones[label] ??
          'border-border bg-muted text-muted-foreground dark:border-border dark:bg-muted/60 dark:text-muted-foreground',
        className
      )}
    >
      {label}
    </Badge>
  )
}
