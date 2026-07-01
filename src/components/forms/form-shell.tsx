import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'

type FormShellProps = {
  action: ComponentProps<'form'>['action']
  backHref: string
  backLabel: string
  breadcrumbs?: ReactNode
  children: ReactNode
  dangerZone?: ReactNode
  description: string
  meta?: ReactNode
  submitHint?: ReactNode
  submitLabel: string
  title: string
}

export function FormShell({
  action,
  backHref,
  backLabel,
  breadcrumbs,
  children,
  dangerZone,
  description,
  meta,
  submitHint,
  submitLabel,
  title,
}: FormShellProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      {breadcrumbs}
      <Button asChild variant="link" className="mb-4 h-auto px-0 text-sm font-medium">
        <Link href={backHref}>← {backLabel}</Link>
      </Button>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="gap-2 border-b border-border/80">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              <CardDescription>{description}</CardDescription>
            </div>
            {meta}
          </div>
        </CardHeader>
        <form action={action}>
          <CardContent className="space-y-6 p-4 sm:p-6">
            {children}
            <div className="flex flex-col gap-3 border-t border-border/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                {submitLabel}
              </Button>
              {submitHint && (
                <p className="text-xs text-muted-foreground">{submitHint}</p>
              )}
            </div>
          </CardContent>
        </form>
      </Card>

      {dangerZone}
    </div>
  )
}

type FormSectionProps = {
  children: ReactNode
  description: string
  title: string
}

export function FormSection({ children, description, title }: FormSectionProps) {
  return (
    <section className="rounded-2xl border border-border/80 bg-background/60 p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}
