'use client'

import Link from 'next/link'
import { AlertTriangle, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'

export default function Error({
  reset,
}: {
  reset: () => void
}) {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4 py-10">
      <Card className="w-full max-w-md border-border/80 text-center shadow-xl shadow-blue-950/5">
        <CardHeader>
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
          <CardDescription>
            The page could not be loaded. Retry the request, or return to the public projects list.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={reset}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/projects">Go to projects</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
