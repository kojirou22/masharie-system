import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
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
  const error = typeof params.error === 'string' ? params.error : ''
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
      redirect(`/login?error=${encodeURIComponent(errors)}&redirect=${encodeURIComponent(requestedRedirect)}`)
    }

    const { error } = await supabase.auth.signInWithPassword(parsed.data)

    if (error) {
      redirect(`/login?error=${encodeURIComponent('Invalid credentials')}&redirect=${encodeURIComponent(requestedRedirect)}`)
    }

    // Single source of truth for admin check — same logic as proxy.ts
    try {
      await requireAdmin()
    } catch {
      await supabase.auth.signOut()
      redirect(`/login?error=${encodeURIComponent('Access denied. Admin only.')}`)
    }

    redirect(requestedRedirect)
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm shadow-blue-100/60 w-full max-w-sm">
        <h1 className="text-xl font-bold text-slate-950 mb-2 text-center font-[family-name:var(--font-fira-code)]">
          Admin Login
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          This area is for administrators only.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {decodeURIComponent(error)}
          </div>
        )}

        <form action={login} className="space-y-4">
          <input type="hidden" name="redirect" value={redirectTo} />
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-blue-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="admin@example.org"
              className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-blue-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          Public projects/payments/expenses do not require login.
        </p>
      </div>
    </div>
  )
}
