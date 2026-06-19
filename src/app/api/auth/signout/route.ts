import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return NextResponse.redirect(new URL('/login?error=signout', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'), { status: 302 })
  }

  return NextResponse.redirect(new URL('/projects', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'), { status: 302 })
}
