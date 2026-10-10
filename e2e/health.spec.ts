import { ADMIN, ON_PP, expect, expectPage, signIn, test } from './support'

/**
 * Health and the public surface (#56 #88). Guest checks are read-only, so they also run against production.
 * Nothing here calls an identify provider.
 */
const onPp = ON_PP

test.describe('public surface', { tag: '@prod' }, () => {
  test('GET /api/health answers with the version and env, and a request id', async ({ page }) => {
    const res = await page.request.get('/api/health')
    expect(res.ok()).toBeTruthy()
    const body = (await res.json()) as { ok: boolean; version: string; env: string }
    expect(body.ok).toBe(true)
    expect(body.version).toBeTruthy()
    expect(['qa', 'prod']).toContain(body.env)
    expect(res.headers()['x-request-id']).toMatch(/^[A-Za-z0-9._-]{8,80}$/)
  })

  test('/api/env names no env variables', async ({ page }) => {
    const res = await page.request.get('/api/env')
    expect(res.ok()).toBeTruthy()
    const body = (await res.json()) as Record<string, unknown>
    expect(body).not.toHaveProperty('missing')
    expect(JSON.stringify(body)).not.toMatch(/GEMINI|PLANTNET|API_KEY/i)
    expect(res.headers()['x-content-type-options']).toBe('nosniff')
  })

  test('the old token test login is gone everywhere', async ({ page }) => {
    expect((await page.request.get('/api/session/test-users')).status()).toBe(404)
    expect((await page.request.post('/api/session/test-login', { data: { userId: ADMIN } })).status()).toBe(404)
  })

  test('password sign-in is off outside PP', async ({ page }) => {
    test.skip(onPp, 'PP signs in with email + password on purpose')
    const config = (await (await page.request.get('/api/session/password')).json()) as { enabled: boolean; preprod: boolean }
    expect(config).toEqual({ enabled: false, preprod: false })
    const login = { email: 'test-user-001@preprod.invalid', password: 'not-a-password' }
    expect((await page.request.post('/api/session/password', { data: login })).status()).toBe(404)
    expect((await page.request.post('/api/session/signup', { data: login })).status()).toBe(404)
  })

  test('the API docs are for the admin in production', async ({ page }) => {
    const { env } = (await (await page.request.get('/api/env')).json()) as { env: string }
    test.skip(env !== 'prod', 'QA keeps the docs open for local work')
    expect([401, 403]).toContain((await page.request.get('/api/openapi.json')).status())
    expect([401, 403]).toContain((await page.request.get('/api/docs')).status())
  })

  test('the static site sends security headers and no wildcard CORS', async ({ page }) => {
    const res = await page.request.get('/')
    test.skip(!res.headers()['x-vercel-id'], 'headers come from the Vercel build; the QA dev server has none')
    const headers = res.headers()
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'")
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(headers['access-control-allow-origin']).not.toBe('*')
  })
})

test.describe('crash intake', () => {
  test('a browser crash report needs a message', async ({ page }) => {
    const empty = await page.request.post('/api/health/client-error', { data: { message: '' } })
    expect(empty.status()).toBe(400)
  })

  test('a browser crash report is accepted', async ({ page }) => {
    test.skip(onPp, 'keeps test crashes out of PP logs and alerts')
    const res = await page.request.post('/api/health/client-error', {
      data: { message: 'e2e crash report', page: 'http://example.test/greenhouse?secret=1', stack: 'Error: e2e' },
    })
    expect(res.status()).toBe(204)
  })
})

test.describe('admin', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, ADMIN)
  })

  test('System health shows the API, database, migrations, identify keys, errors and alerts', async ({ page }) => {
    const api = await page.request.get('/api/system/health')
    expect(api.ok()).toBeTruthy()
    const { health } = (await api.json()) as { health: { database: { ok: boolean }; missing: unknown[] } }
    expect(health.database.ok).toBe(true)
    expect(Array.isArray(health.missing)).toBe(true)

    // System health sits at the top of Admin → Server.
    await expectPage(page, '/admin/server')
    const card = page.locator('[data-system-health]')
    await expect(card.getByRole('heading', { name: 'System health' })).toBeVisible()
    for (const row of ['api', 'db', 'migrations', 'identify', 'errors', 'alerts']) {
      await expect(card.locator(`[data-health-row="${row}"]`)).toBeVisible()
    }
    await expect(card.locator('[data-health-row="db"]')).toHaveAttribute('data-tone', 'ok')
    await card.getByRole('button', { name: 'Refresh' }).click()
    await expect(card.getByText(/Last updated/)).toBeVisible()
  })

  test('a guest cannot read System health', async ({ page }) => {
    await page.context().clearCookies()
    expect([401, 403]).toContain((await page.request.get('/api/system/health')).status())
  })
})
