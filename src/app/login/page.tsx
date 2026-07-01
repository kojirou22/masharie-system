import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LockKeyhole, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { setFlash } from '@/lib/flash'
import { loginSchema } from '@/lib/validations/auth'

function safeRedirectPath(value: string | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/dashboard'
  }

  return value
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const redirectTo = safeRedirectPath(typeof params.redirect === 'string' ? params.redirect : undefined)

  async function login(formData: FormData) {
    'use server'

    const supabase = await createClient()
    const requestedRedirect = safeRedirectPath(formData.get('redirect') as string | undefined)

    const raw = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const parsed = loginSchema.safeParse(raw)
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message).join(', ')
      await setFlash('error', errors)
      redirect(`/login?redirect=${encodeURIComponent(requestedRedirect)}`)
    }

    const { error } = await supabase.auth.signInWithPassword(parsed.data)

    if (error) {
      await setFlash('error', 'Invalid credentials')
      redirect(`/login?redirect=${encodeURIComponent(requestedRedirect)}`)
    }

    // Single source of truth for admin check — same logic as proxy.ts
    try {
      await requireAdmin()
    } catch {
      await supabase.auth.signOut()
      await setFlash('error', 'Access denied. Admin only.')
      redirect('/login')
    }

    await setFlash('success', 'Signed in successfully.')
    redirect(requestedRedirect)
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <ShieldCheck className="size-7" aria-hidden="true" />
          </div>
        </div>

        <Card className="border-border/80 shadow-xl shadow-blue-950/5">
          <CardHeader className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Admin login</h1>
            <CardDescription>
              Secure access for dashboard, project, payment, and expense operations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={login} className="space-y-4">
              <input type="hidden" name="redirect" value={redirectTo} />
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@example.org"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" size="lg" className="w-full">
                <LockKeyhole className="size-4" aria-hidden="true" />
                Sign in
              </Button>
            </form>

            <div className="mt-5 rounded-xl bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">
                Public projects, payments, and expenses remain available without login.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/projects">Projects</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/payments">Payments</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/expenses">Expenses</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
