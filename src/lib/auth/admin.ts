import { redirect } from 'next/navigation'
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
