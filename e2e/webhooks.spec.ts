import { ADMIN, expect, expectPage, signIn, test } from './support'

/**
 * Admin → Webhooks: each outgoing webhook, whether its env URL is set (never the URL), its on/off switch
 * and Send test. The test flips one switch and puts it back; it never sends a test message.
 */
test.describe('admin webhooks', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, ADMIN)
  })

  test('lists every webhook without its URL, and a switch turns one off and on', async ({ page }) => {
    const api = await page.request.get('/api/admin/webhooks')
    expect(api.ok()).toBeTruthy()
    const raw = await api.text()
    expect(raw).not.toMatch(/https?:\/\//)
    const { webhooks } = JSON.parse(raw) as { webhooks: { id: string; enabled: boolean }[] }
    expect(webhooks.map((hook) => hook.id)).toEqual(['alerts', 'signups', 'signins', 'activities'])
    const wasOn = webhooks.find((hook) => hook.id === 'signins')?.enabled ?? true

    await expectPage(page, '/admin/webhooks')
    const panel = page.locator('[data-webhooks]')
    await expect(panel.getByRole('heading', { name: 'Webhooks' })).toBeVisible()
    for (const id of ['alerts', 'signups', 'signins', 'activities', 'github']) {
      await expect(panel.locator(`[data-webhook="${id}"]`)).toBeVisible()
    }
    // Send test only works when the env URL is set on this deployment.
    for (const row of await panel.locator('[data-webhook]:has([data-configured="false"])').all()) {
      await expect(row.getByRole('button', { name: 'Send test' })).toBeDisabled()
    }

    const signins = panel.locator('[data-webhook="signins"]')
    const toggle = signins.getByRole('switch', { name: 'Sign-ins' })
    await toggle.click()
    await expect(signins.getByText(wasOn ? 'Off' : 'On', { exact: true })).toBeVisible()
    await page.reload()
    await expect(page.locator('[data-webhook="signins"]').getByText(wasOn ? 'Off' : 'On', { exact: true })).toBeVisible()
    // Put it back.
    await page.locator('[data-webhook="signins"]').getByRole('switch', { name: 'Sign-ins' }).click()
    await expect(page.locator('[data-webhook="signins"]').getByText(wasOn ? 'On' : 'Off', { exact: true })).toBeVisible()
  })

  test('a guest cannot read or change webhooks', async ({ page }) => {
    await page.context().clearCookies()
    expect([401, 403]).toContain((await page.request.get('/api/admin/webhooks')).status())
    expect([401, 403]).toContain((await page.request.put('/api/admin/webhooks/alerts', { data: { enabled: false } })).status())
    expect([401, 403]).toContain((await page.request.post('/api/admin/webhooks/alerts/test')).status())
  })
})
