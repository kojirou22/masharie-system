import { assertAdmin } from '@/lib/auth/admin'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_ROUTES = [
  '/dashboard',
  '/projects/new',
  '/projects/:id/edit',
  '/payments/new',
  '/payments/:id/edit',
  '/expenses/new',
  '/expenses/:id/edit',
]

function isProtectedRoute(pathname: string) {
  return ADMIN_ROUTES.some((route) => {
    if (route === '/projects/:id/edit') {
      return /^\/projects\/[^/]+\/edit$/.test(pathname)
    }

    if (route === '/payments/:id/edit') {
      return /^\/payments\/[^/]+\/edit$/.test(pathname)
    }

    if (route === '/expenses/:id/edit') {
      return /^\/expenses\/[^/]+\/edit$/.test(pathname)
    }

    return pathname === route || pathname.startsWith(route + '/')
  })
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next()
  }

  const result = await assertAdmin(request)
  if (!result.allowed) {
    return result.response
  }

  return result.response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/projects/new',
    '/projects/:id/edit',
    '/payments/new',
    '/payments/:id/edit',
    '/expenses/new',
    '/expenses/:id/edit',
  ],
}
