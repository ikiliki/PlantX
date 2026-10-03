import { expectPage, signIn, test, expect } from './support'

test.describe('guest', () => {
  test('greenhouse asks a guest to sign in', async ({ page }) => {
    await expectPage(page, '/greenhouse')
    await expect(page.getByRole('link', { name: /log in|sign in/i }).or(page.getByRole('button', { name: /log in|sign in/i })).first()).toBeVisible()
  })

  test('landing loads', async ({ page }) => {
    await page.goto('/landing')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading').first()).toBeVisible()
  })
})

test.describe('signed in', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  for (const path of ['/home', '/greenhouse', '/tasks', '/wiki', '/market']) {
    test(`page ${path}`, async ({ page }) => {
      await expectPage(page, path)
    })
  }

  test('admin APIs shows the three stages', async ({ page }) => {
    await expectPage(page, '/admin/apis')
    for (const stage of ['Plant check', 'Species', 'Catalog fields']) {
      await expect(page.getByRole('radio', { name: stage }).or(page.getByRole('button', { name: stage })).first()).toBeVisible()
    }
    // The detail grid label, not the Ready (no API key) option inside the closed select.
    await expect(page.getByRole('term').filter({ hasText: /^API key$/i }).first()).toBeVisible()
  })
})
