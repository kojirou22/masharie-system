import Link from 'next/link'

import { SearchX } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'

export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4 py-10">
      <Card className="w-full max-w-md border-border/80 text-center shadow-xl shadow-blue-950/5">
        <CardHeader>
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <SearchX className="size-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
          <CardDescription>
            The page you requested does not exist, moved, or is no longer available.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/projects">Go to projects</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Return home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
