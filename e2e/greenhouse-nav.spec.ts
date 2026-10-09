import { MEMBER, expect, expectPage, signIn, test } from './support'

/** Getting to All greenhouses: the phone dock's ^ menu and the desktop drop-down; the directory sort; the way back. */
test.describe('greenhouse navigation', { tag: '@prod' }, () => {
  test('the phone dock ^ opens the Greenhouse menu and leads to All greenhouses', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'The dock is the phone navigation')
    await expectPage(page, '/greenhouse')
    await page.getByRole('button', { name: 'Open the Greenhouse menu' }).click()
    const menu = page.getByRole('menu', { name: 'Greenhouse' })
    await expect(menu).toBeVisible()
    await menu.getByRole('menuitem', { name: 'All greenhouses' }).click()
    await expect(page).toHaveURL(/\/greenhouse\?scope=global/)
    await expect(menu).toHaveCount(0)
  })

  test('the desktop Greenhouse drop-down leads to All greenhouses', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'phone', 'The drop-down is the desktop navigation')
    await expectPage(page, '/greenhouse')
    await page.getByRole('banner').getByRole('button', { name: 'Greenhouse' }).click()
    await page.getByRole('menuitem', { name: 'All greenhouses' }).click()
    await expect(page).toHaveURL(/\/greenhouse\?scope=global/)
  })
})

test.describe('all greenhouses (member)', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, MEMBER)
  })

  test('Most plants sorts the cards by plant count, highest first', async ({ page }) => {
    await page.goto('/greenhouse?scope=global')
    await expect(page.locator('[data-greenhouse-skeleton]')).toHaveCount(0, { timeout: 20_000 })
    await page.getByRole('radio', { name: 'Most plants' }).click()
    await expect(page.getByRole('radio', { name: 'Most plants' })).toHaveAttribute('aria-checked', 'true')
    const cards = page.locator('[data-greenhouse]:not([data-verified])')
    test.skip((await cards.count()) < 2, 'fewer than two greenhouses to compare')
    const counts = (await cards.allInnerTexts()).map((text) => Number(/(\d+) plants?/.exec(text)?.[1] ?? 0))
    expect(counts, 'plant counts never rise down the list').toEqual([...counts].sort((a, b) => b - a))
  })

  test('a grower page leads back to All greenhouses', async ({ page }) => {
    await page.goto('/greenhouse?scope=global')
    await expect(page.locator('[data-greenhouse-skeleton]')).toHaveCount(0, { timeout: 20_000 })
    const first = page.locator('[data-greenhouse]').first()
    test.skip((await first.count()) === 0, 'no other greenhouses on this data set')
    await first.click()
    await expect(page).toHaveURL(/\/greenhouse\/[^/?]+$/)
    await page.getByRole('main').getByRole('link', { name: 'All greenhouses' }).click()
    await expect(page).toHaveURL(/\/greenhouse\?scope=global/)
  })
})
