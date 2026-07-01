const ADMIN_ROUTES = [
  '/dashboard',
  '/projects/new',
  '/projects/:id/edit',
  '/payments/new',
  '/payments/:id/edit',
  '/expenses/new',
  '/expenses/:id/edit',
]

export function isProtectedRoute(pathname: string) {
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
