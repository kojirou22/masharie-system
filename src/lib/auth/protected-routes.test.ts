import { describe, expect, it } from 'vitest'

import { isProtectedRoute } from './protected-routes'

describe('protected route matching', () => {
  it('protects admin creation and edit routes', () => {
    expect(isProtectedRoute('/dashboard')).toBe(true)
    expect(isProtectedRoute('/dashboard/reports')).toBe(true)
    expect(isProtectedRoute('/projects/new')).toBe(true)
    expect(isProtectedRoute('/projects/abc/edit')).toBe(true)
    expect(isProtectedRoute('/payments/new')).toBe(true)
    expect(isProtectedRoute('/payments/abc/edit')).toBe(true)
    expect(isProtectedRoute('/expenses/new')).toBe(true)
    expect(isProtectedRoute('/expenses/abc/edit')).toBe(true)
  })

  it('keeps public registry and detail routes public', () => {
    expect(isProtectedRoute('/')).toBe(false)
    expect(isProtectedRoute('/projects')).toBe(false)
    expect(isProtectedRoute('/projects/abc')).toBe(false)
    expect(isProtectedRoute('/payments')).toBe(false)
    expect(isProtectedRoute('/expenses')).toBe(false)
    expect(isProtectedRoute('/login')).toBe(false)
  })
})
