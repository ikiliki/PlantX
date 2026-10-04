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

  test('greenhouse activity shows only its header to a guest, no XP / All filter', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'phone', 'Phones keep the activity behind the signed-in bell')
    await expectPage(page, '/greenhouse')
    const rail = page.getByRole('complementary', { name: 'Greenhouse activities' })
    await expect(rail.getByRole('heading', { name: 'Greenhouse activities' })).toBeVisible()
    await expect(rail.getByRole('radiogroup')).toHaveCount(0)
  })

  test('greenhouse header shows an empty greenhouse, not a placeholder', async ({ page }) => {
    await expectPage(page, '/greenhouse')
    const header = page.getByRole('complementary', { name: /greenhouse level/i })
    await expect(header.getByText(/level 1/i)).toBeVisible()
    await expect(header.getByText(/0 plants/i)).toBeVisible()
  })

  test('Add tile is the same size as the cards next to it; phones show no placeholder cards', async ({ page }, testInfo) => {
    await expectPage(page, '/greenhouse')
    const tile = page.getByRole('button', { name: /try adding a plant/i }).first()
    // Placeholder cards sit in their own wrapper inside the grid; the add tile is the grid's button.
    const placeholders = page.locator('[data-plant-grid] > div > [aria-hidden="true"]')
    if (testInfo.project.name === 'phone') {
      await expect(placeholders.first()).toBeHidden()
      return
    }
    const tileBox = await tile.boundingBox()
    const cardBox = await placeholders.first().boundingBox()
    expect(tileBox && cardBox && Math.abs(tileBox.height - cardBox.height)).toBeLessThanOrEqual(2)
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

  test('Suggest a plant asks a guest to sign in first', async ({ page }) => {
    await expectPage(page, '/wiki')
    await page.getByRole('button', { name: /suggest a plant/i }).click()
    await expect(page.getByRole('dialog').filter({ hasText: /log in|sign in|google/i }).last()).toBeVisible()
    await expect(page.getByRole('dialog', { name: 'Suggest a plant' })).toHaveCount(0)
  })
})

// The landing is its own domain in production, so it stays out of @prod.
test('landing loads', async ({ page }) => {
  // The landing auto-advances its AI steps and keeps loading stills, so the network may never go idle.
  await page.goto('/landing', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 20_000 })
})
