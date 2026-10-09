import { MEMBER, expect, expectPage, openAddPlant, plantPhoto, signIn, test } from './support'

/** W0 / W4 pieces of PR #65: scan quota (#67), moderation (#69), wording (#20), calendar names (#44). */
test.describe('signed in', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('scan quota API answers for the signed-in member', async ({ page }) => {
    const res = await page.request.get('/api/identify/quota')
    expect(res.ok(), `quota: HTTP ${res.status()}`).toBeTruthy()
    const { quota } = (await res.json()) as { quota: Record<string, unknown> }
    for (const key of ['used', 'limit', 'extra', 'remaining']) expect(typeof quota[key]).toBe('number')
    expect(typeof quota.resetsAt).toBe('string')
  })

  test('the account popup signs out without demo wording', async ({ page }) => {
    await expectPage(page, '/settings')
    const account = page.getByRole('dialog', { name: 'Account' })
    await expect(account.getByRole('button', { name: 'Sign out' })).toBeVisible()
    await expect(page.getByText('Exit to demo login')).toHaveCount(0)
  })

  test('tasks calendar month buttons have names', async ({ page }, testInfo) => {
    // Phones with no plants show the first-plant card instead of the calendar.
    test.skip(testInfo.project.name === 'phone', 'the calendar is not shown on an empty phone greenhouse')
    await expectPage(page, '/tasks')
    await expect(page.getByRole('button', { name: 'Previous month' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Next month' })).toBeVisible()
  })

  test('admin moderation lists users, plants and activities', async ({ page }) => {
    await expectPage(page, '/admin/moderation')
    for (const type of ['Users', 'Plants', 'Activities']) {
      await expect(page.getByRole('radio', { name: type }).or(page.getByRole('button', { name: type })).first()).toBeVisible()
    }
    await expect(page.getByRole('searchbox', { name: 'Search by name' })).toBeVisible()
  })
})

/** The admin is not scan-limited (#72), so the allowance UI is checked as a plain member. */
test.describe('member scan allowance', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, MEMBER)
  })

  test('Add Plant: no scans left says so and keeps AI off', async ({ page }) => {
    const resetsAt = new Date(Date.now() + 3_600_000).toISOString()
    await page.route('**/api/identify/quota', (route) =>
      route.fulfill({ json: { quota: { used: 3, limit: 3, extra: 0, remaining: 0, resetsAt } } }),
    )
    const dialog = await openAddPlant(page)
    await expect(dialog.locator('[data-scan-quota]')).toContainText('None left')
    await dialog.locator('input[type=file]').first().setInputFiles(plantPhoto())
    await expect(dialog.getByRole('button', { name: 'Continue with AI' })).toBeDisabled()
    await expect(dialog.getByRole('button', { name: 'Fill in manually' })).toBeEnabled()
  })

  test('Add Plant: scans left are counted', async ({ page }) => {
    const resetsAt = new Date(Date.now() + 3_600_000).toISOString()
    await page.route('**/api/identify/quota', (route) =>
      route.fulfill({ json: { quota: { used: 1, limit: 3, extra: 0, remaining: 2, resetsAt } } }),
    )
    const dialog = await openAddPlant(page)
    await expect(dialog.locator('[data-scan-quota]')).toContainText('2 of 3 left')
  })
})
