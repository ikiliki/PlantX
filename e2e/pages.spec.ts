import { expectPage, signIn, test, expect } from './support'

/** Signed in through the QA session route or the PP test login; never runs against production. */

test.describe('signed in', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  for (const path of ['/home', '/greenhouse', '/tasks', '/wiki', '/market']) {
    test(`page ${path}`, async ({ page }) => {
      await expectPage(page, path)
    })
  }

  test('greenhouse Add tile is disabled until the plants arrive', async ({ page }) => {
    let release: () => void = () => {}
    const held = new Promise<void>((resolve) => (release = resolve))
    await page.route('**/api/plants**', async (route) => {
      if (route.request().method() === 'GET') await held
      await route.fallback()
    })
    await page.goto('/greenhouse')
    const tile = page.locator('[data-plant-grid] > button').first()
    await expect(tile).toBeDisabled()
    release()
    await expect(tile).toBeEnabled()
  })

  test('home feed shows only activities that earn XP, with their XP', async ({ page }) => {
    const at = new Date().toISOString()
    const extra = [
      { id: 'e2e-scan', kind: 'scan', userId: 'u-admin', body: 'e2e scan', bodyHe: 'e2e scan', createdAt: at },
      { id: 'e2e-water', kind: 'water', userId: 'u-admin', body: 'e2e watered', bodyHe: 'e2e watered', createdAt: at },
    ]
    await page.route('**/api/activities', async (route) => {
      if (route.request().method() !== 'GET') return route.fallback()
      const res = await route.fetch()
      const body = (await res.json()) as { activities: unknown[] }
      await route.fulfill({ response: res, json: { activities: [...extra, ...body.activities] } })
    })
    await expectPage(page, '/home')
    // Desktop Home lists feed rows; the phone's daily Home shows Social cards. Either way: XP kinds only.
    const row = (id: string) => page.locator(`[data-feed-update="${id}"], [data-feed-post="${id}"]`)
    await expect(row('e2e-water')).toContainText('+10 XP')
    await expect(row('e2e-scan')).toHaveCount(0)
  })

  test('greenhouse activity opens on XP; All adds my scans', async ({ page }, testInfo) => {
    const at = new Date().toISOString()
    const scan = { id: 'e2e-own-scan', kind: 'scan', userId: 'u-admin', body: 'e2e own scan', bodyHe: 'e2e own scan', createdAt: at }
    await page.route('**/api/activities', async (route) => {
      if (route.request().method() !== 'GET') return route.fallback()
      const res = await route.fetch()
      const body = (await res.json()) as { activities: unknown[] }
      await route.fulfill({ response: res, json: { activities: [scan, ...body.activities] } })
    })
    await expectPage(page, '/greenhouse')
    // Phones keep the activity behind the top-bar bell.
    if (testInfo.project.name === 'phone') await page.getByRole('button', { name: 'Greenhouse activities' }).click()
    const rail = page.getByRole('complementary', { name: 'Greenhouse activities' })
    await expect(rail.getByRole('radio', { name: 'XP' })).toBeChecked()
    await expect(rail.getByText('e2e own scan')).toHaveCount(0)
    await rail.getByRole('radio', { name: 'All' }).click()
    await expect(rail.getByText('e2e own scan')).toBeVisible()
  })

  test('admin APIs shows the three stages', async ({ page }) => {
    await expectPage(page, '/admin/apis')
    for (const stage of ['Plant check', 'Species', 'Catalog fields']) {
      await expect(page.getByRole('radio', { name: stage }).or(page.getByRole('button', { name: stage })).first()).toBeVisible()
    }
    // The detail grid label, not the Ready (no API key) option inside the closed select.
    await expect(page.getByRole('term').filter({ hasText: /^API key$/i }).first()).toBeVisible()
  })
})
