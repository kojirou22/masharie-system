const DEFAULT_BASE_URL = 'http://127.0.0.1:3011'

const routes = [
  { path: '/', expected: [200] },
  { path: '/projects', expected: [200] },
  { path: '/payments', expected: [200] },
  { path: '/expenses', expected: [200] },
  { path: '/login', expected: [200] },
  { path: '/dashboard', expected: [307, 308], redirectIncludes: '/login' },
  { path: '/payments/new', expected: [307, 308], redirectIncludes: '/login' },
  { path: '/expenses/new', expected: [307, 308], redirectIncludes: '/login' },
]

if (process.env.MASHARIE_PROJECT_DETAIL_PATH) {
  const projectDetailPath = process.env.MASHARIE_PROJECT_DETAIL_PATH.startsWith('/')
    ? process.env.MASHARIE_PROJECT_DETAIL_PATH
    : `/${process.env.MASHARIE_PROJECT_DETAIL_PATH}`
  routes.push({ path: projectDetailPath, expected: [200] })
}

const baseUrl = process.env.MASHARIE_BASE_URL ?? DEFAULT_BASE_URL

async function smokeRoute(route) {
  const response = await fetch(new URL(route.path, baseUrl), { redirect: 'manual' })
  const location = response.headers.get('location') ?? ''
  const statusOk = route.expected.includes(response.status)
  const redirectOk = route.redirectIncludes ? location.includes(route.redirectIncludes) : true

  return {
    path: route.path,
    status: response.status,
    location,
    ok: statusOk && redirectOk,
  }
}

const results = await Promise.all(routes.map(smokeRoute))

for (const result of results) {
  const suffix = result.location ? ` -> ${result.location}` : ''
  console.log(`${result.ok ? 'PASS' : 'FAIL'} ${result.path} HTTP ${result.status}${suffix}`)
}

const failed = results.filter((result) => !result.ok)
if (failed.length > 0) {
  process.exitCode = 1
}
