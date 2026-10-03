import { expect, expectPage, plantPhoto, test } from './support'

/**
 * Signed out. Nothing here signs in or writes, so `@prod` tests also run against production after a release.
 */
test.describe('guest', { tag: '@prod' }, () => {
  test('greenhouse shows the Add tile and Log in in the top bar, no log-in card', async ({ page }) => {
    await expectPage(page, '/greenhouse')
    await expect(page.getByRole('banner').getByRole('link', { name: /log in/i }).or(page.getByRole('banner').getByRole('button', { name: /log in/i })).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /try adding a plant/i }).first()).toBeVisible()
    await expect(page.getByText('Log in to see your greenhouse')).toHaveCount(0)
  })

  test('Tasks "Try adding a plant" opens Add Plant on the greenhouse', async ({ page }) => {
    await expectPage(page, '/tasks')
    await page.getByRole('button', { name: 'Try adding a plant' }).click()
    await expect(page).toHaveURL(/\/greenhouse$/)
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('Add Plant asks a guest to sign in before AI, without calling identify', async ({ page }) => {
    let identifyCalls = 0
    page.on('request', (request) => {
      if (request.method() === 'POST' && /\/api\/identify/.test(request.url())) identifyCalls += 1
    })
    await expectPage(page, '/greenhouse')
    await page.getByRole('button', { name: /try adding a plant/i }).first().click()
    const dialog = page.getByRole('dialog').first()
    await dialog.locator('input[type=file]').setInputFiles(plantPhoto())
    await dialog.getByRole('button', { name: 'Continue with AI' }).click()
    await expect(page.getByRole('dialog').filter({ hasText: /log in|sign in|google/i }).last()).toBeVisible()
    expect(identifyCalls).toBe(0)
  })

  test('catalog is open to guests', async ({ page }) => {
    await expectPage(page, '/wiki')
  })
})

// The landing is its own domain in production, so it stays out of @prod.
test('landing loads', async ({ page }) => {
  await page.goto('/landing')
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('heading').first()).toBeVisible()
})
