import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function getAdminUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, user: null, isAdmin: false }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  return { supabase, user, isAdmin: profile?.role === 'admin' }
}

export async function requireAdmin(redirectTo = '/login') {
  const result = await getAdminUser()

  if (!result.user) {
    redirect(redirectTo)
  }

  if (!result.isAdmin) {
    redirect('/unauthorized')
  }

  return {
    supabase: result.supabase,
    user: result.user,
  }
}

export async function requireAdminResponse() {
  const result = await getAdminUser()

  if (!result.user) {
    return { ...result, response: new Response('Unauthorized', { status: 401 }) }
  }

  if (!result.isAdmin) {
    return { ...result, response: new Response('Forbidden', { status: 403 }) }
  }

  return { ...result, response: null }
}

/**
 * Single source of truth for admin checks in proxy/auth middleware.
 * Returns { allowed: true } or { allowed: false, response } with a redirect.
 */
export async function assertAdmin(request: NextRequest) {
  const { pathname } = request.nextUrl

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return { allowed: false, response: new Response('Supabase environment is not configured', { status: 500 }) }
  }

  const { createServerClient } = await import('@supabase/ssr')
  const { NextResponse } = await import('next/server')

  const response = NextResponse.next()
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        } catch {
          // Cookie setting can fail during Server Component rendering.
        }
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return { allowed: false, response: NextResponse.redirect(redirectUrl) }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { allowed: false, response: NextResponse.redirect(new URL('/unauthorized', request.url)) }
  }

  return { allowed: true, response }
}
