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

  test('Add Plant tells a guest up front that AI needs an account, without calling identify', async ({ page }) => {
    let identifyCalls = 0
    page.on('request', (request) => {
      if (request.method() === 'POST' && /\/api\/identify/.test(request.url())) identifyCalls += 1
    })
    await expectPage(page, '/greenhouse')
    await page.getByRole('button', { name: /try adding a plant/i }).first().click()
    const dialog = page.getByRole('dialog').first()
    // Before any photo the button already says log in, and it works.
    const ai = dialog.getByRole('button', { name: 'Log in to use AI' })
    await expect(ai).toBeEnabled()
    await expect(dialog.getByRole('button', { name: 'Continue with AI' })).toHaveCount(0)
    await dialog.locator('input[type=file]').setInputFiles(plantPhoto())
    await ai.click()
    await expect(page.getByRole('dialog').filter({ hasText: /log in|sign in|google/i }).last()).toBeVisible()
    expect(identifyCalls).toBe(0)
  })

  test('guest Home explains PlantX in three steps instead of a blurred feed', async ({ page }) => {
    await expectPage(page, '/home')
    const intro = page.getByRole('region', { name: 'Every plant gets its own story' })
    await expect(intro).toBeVisible()
    for (const step of ['Snap a photo', 'AI suggests what it is', 'Know what’s due']) {
      await expect(intro.getByRole('button', { name: new RegExp(step) })).toBeVisible()
    }
    await expect(page.getByText('Log in to see what’s growing')).toHaveCount(0)
    // Picking a step holds it there.
    const aiStep = intro.getByRole('button', { name: /AI suggests what it is/ })
    await aiStep.click()
    await expect(aiStep).toHaveAttribute('aria-current', 'step')
    // Try adding a plant opens Add Plant on the greenhouse.
    await intro.getByRole('button', { name: /try adding a plant/i }).click()
    await expect(page).toHaveURL(/\/greenhouse/)
    await expect(page.getByRole('dialog').first().locator('input[type=file]')).toBeAttached()
  })

  test('coming-soon market keeps sample listings out of the accessibility tree', async ({ page }) => {
    await page.goto('/market')
    await page.waitForLoadState('networkidle')
    // The whole page can be under maintenance instead (QA): that hold has its own test below.
    const pill = page.getByRole('status').filter({ hasText: 'Sample listings, not real prices' })
    test.skip((await pill.count()) === 0, 'Market page is open or under maintenance here, not coming soon')
    await expect(pill.first()).toContainText(/coming soon|under maintenance/i)
    await expect(page.locator('[inert][aria-hidden="true"]')).toHaveCount(1)
  })

  test('a page under maintenance names itself and links only to open pages', async ({ page }) => {
    await page.goto('/market')
    await page.waitForLoadState('networkidle')
    const hold = page.getByText('Market is under maintenance')
    test.skip((await hold.count()) === 0, 'Market page is not under maintenance here')
    const links = page.getByRole('navigation', { name: 'Open pages' }).getByRole('link')
    await expect(links.first()).toBeVisible()
    await expect(links.filter({ hasText: /^Market$/ })).toHaveCount(0)
    await expect(page.getByText('opens when PlantX launches')).toHaveCount(0)
  })

  test('catalog is open to guests', async ({ page }) => {
    await expectPage(page, '/wiki')
  })

  test('a plant from the October catalog has its wiki article', async ({ page }) => {
    await expectPage(page, '/wiki/sp-staghorn')
    await expect(page.getByRole('heading', { name: 'Staghorn fern' }).first()).toBeVisible()
    await expect(page.getByText('Platycerium bifurcatum').first()).toBeVisible()
    await expect(page.getByText('Soak the mount, then let it dry slightly').first()).toBeVisible()
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
