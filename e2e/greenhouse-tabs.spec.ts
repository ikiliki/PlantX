import { MEMBER, expect, expectPage, signIn, test } from './support'

/** My greenhouse / All greenhouses tabs, the directory sort and the grower page's way back. */
test.describe('greenhouse tabs', { tag: '@prod' }, () => {
  test('the tabs are on screen and switch to All greenhouses', async ({ page }) => {
    await expectPage(page, '/greenhouse')
    const tabs = page.getByRole('navigation', { name: 'Greenhouses' })
    await expect(tabs.getByRole('link', { name: 'My greenhouse' })).toHaveAttribute('aria-current', 'page')
    await tabs.getByRole('link', { name: 'All greenhouses' }).click()
    await expect(page).toHaveURL(/\/greenhouse\?scope=global/)
    await expect(tabs.getByRole('link', { name: 'All greenhouses' })).toHaveAttribute('aria-current', 'page')
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
    await page.getByRole('link', { name: 'All greenhouses' }).first().click()
    await expect(page).toHaveURL(/\/greenhouse\?scope=global/)
  })
})
