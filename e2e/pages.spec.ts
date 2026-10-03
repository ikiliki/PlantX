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

  test('admin APIs shows the three stages', async ({ page }) => {
    await expectPage(page, '/admin/apis')
    for (const stage of ['Plant check', 'Species', 'Catalog fields']) {
      await expect(page.getByRole('radio', { name: stage }).or(page.getByRole('button', { name: stage })).first()).toBeVisible()
    }
    // The detail grid label, not the Ready (no API key) option inside the closed select.
    await expect(page.getByRole('term').filter({ hasText: /^API key$/i }).first()).toBeVisible()
  })
})
