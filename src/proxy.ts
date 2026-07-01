import { assertAdmin } from '@/lib/auth/admin'
import { isProtectedRoute } from '@/lib/auth/protected-routes'
import { NextResponse, type NextRequest } from 'next/server'

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
