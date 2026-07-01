import Link from 'next/link'

import { ShieldX } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'

export default function Unauthorized() {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md border-border/80 text-center shadow-xl shadow-blue-950/5">
        <CardHeader>
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldX className="size-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Access restricted</h1>
          <CardDescription>
            This page requires an administrator account. Your current session cannot open it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/login">Admin login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/projects">View public projects</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
