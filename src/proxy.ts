import { assertAdmin } from '@/lib/auth/admin'
import type { NextRequest } from 'next/server'

const ADMIN_ROUTES = [
  '/dashboard',
  '/projects/new',
  '/projects/:id/edit',
  '/payments/new',
  '/expenses/new',
  '/reports',
  '/api/reports',
  '/api/projects',
]

function isProtectedRoute(pathname: string) {
  return ADMIN_ROUTES.some((route) => {
    if (route === '/projects/:id/edit') {
      return /^\/projects\/[^/]+\/edit$/.test(pathname)
    }

    return pathname === route || pathname.startsWith(route + '/')
  })
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isProtectedRoute(pathname)) {
    return (await import('next/server')).NextResponse.next()
  }

  const result = await assertAdmin(request)
  if (!result.allowed) {
    return result.response
  }

  return (await import('next/server')).NextResponse.next()
}
