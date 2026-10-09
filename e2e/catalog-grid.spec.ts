import { expect, expectPage, test } from './support'

const ORDER = ['common', 'rare', 'unique']

/** Catalog photo grid. Signed out and read-only, so it also runs on production. */
test.describe('catalog grid', { tag: '@prod' }, () => {
  test('tiles are sorted by rarity, the search and a rarity chip narrow them', async ({ page }) => {
    await expectPage(page, '/wiki')
    const grid = page.locator('[data-catalog-grid]')
    const tiles = grid.locator('[data-catalog-tile]')
    await expect(tiles.first()).toBeVisible()

    const rarities = await tiles.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-rarity') ?? ''))
    const ranks = rarities.map((rarity) => ORDER.indexOf(rarity))
    expect(ranks, 'common first, then rare, then unique').toEqual([...ranks].sort((a, b) => a - b))

    const chips = grid.getByRole('tablist', { name: 'Catalog' }).getByRole('tab')
    if ((await chips.count()) > 2) {
      await chips.nth(1).click()
      const only = rarities[0]
      const shown = await tiles.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-rarity')))
      expect(new Set(shown)).toEqual(new Set([only]))
      await chips.first().click()
    }

    const name = (await tiles.first().locator('span').nth(1).innerText()).trim()
    await grid.getByRole('searchbox', { name: 'Search plants' }).fill(name)
    await expect(tiles.first()).toContainText(name)
    const names = await tiles.evaluateAll((nodes) => nodes.map((node) => node.textContent ?? ''))
    for (const text of names) expect(text.toLowerCase()).toContain(name.toLowerCase())
  })
})
