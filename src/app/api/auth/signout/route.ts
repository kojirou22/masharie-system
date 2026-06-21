import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function redirectWithFlash(path: string, type: 'success' | 'error', message: string) {
  const response = NextResponse.redirect(new URL(path, process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'), { status: 302 })
  response.cookies.set('masharie_flash', encodeURIComponent(JSON.stringify({ type, message })), {
    path: '/',
    maxAge: 30,
    sameSite: 'lax',
  })
  return response
}

export async function POST() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return redirectWithFlash('/login', 'error', 'Sign out failed. Please try again.')
  }

  return redirectWithFlash('/projects', 'success', 'Signed out successfully.')
}
