import type { Locator } from '@playwright/test'
import { MEMBER, expect, expectPage, signIn, test } from './support'

/** A touch press held for `ms`, then released, without moving. */
async function press(target: Locator, ms: number) {
  const box = await target.boundingBox()
  const at = { clientX: (box?.x ?? 0) + (box?.width ?? 0) / 2, clientY: (box?.y ?? 0) + (box?.height ?? 0) / 2 }
  const init = { ...at, button: 0, pointerId: 7, pointerType: 'touch', isPrimary: true, bubbles: true }
  await target.dispatchEvent('pointerdown', init)
  await target.page().waitForTimeout(ms)
  await target.dispatchEvent('pointerup', init)
}

/** Getting to the Global greenhouses: the phone dock's ^ menu (or a hold), the desktop drop-down; the sort; the way back. */
test.describe('greenhouse navigation', { tag: '@prod' }, () => {
  test('the phone dock ^ opens the Greenhouse menu and leads to Global', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'The dock is the phone navigation')
    await expectPage(page, '/greenhouse')
    await page.getByRole('button', { name: 'Open the Greenhouse menu' }).click()
    const menu = page.getByRole('menu', { name: 'Greenhouse' })
    await expect(menu).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: 'Mine' })).toBeVisible()
    await menu.getByRole('menuitem', { name: 'Global' }).click()
    await expect(page).toHaveURL(/\/greenhouse\?scope=global/)
    await expect(menu).toHaveCount(0)
  })

  test('holding the Greenhouse dock item opens its menu without leaving the page', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'The dock is the phone navigation')
    await expectPage(page, '/wiki')
    const item = page.locator('[data-dock] a[href="/greenhouse"]')
    await press(item, 700)
    await expect(page.getByRole('menu', { name: 'Greenhouse' })).toBeVisible()
    await expect(page).toHaveURL(/\/wiki$/)
  })

  test('the desktop Greenhouse drop-down leads to Global', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'phone', 'The drop-down is the desktop navigation')
    await expectPage(page, '/greenhouse')
    await page.getByRole('banner').getByRole('button', { name: 'Greenhouse' }).click()
    await page.getByRole('menuitem', { name: 'Global' }).click()
    await expect(page).toHaveURL(/\/greenhouse\?scope=global/)
  })
})

test.describe('global greenhouses (member)', () => {
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

  test('a grower page leads back to Global', async ({ page }) => {
    await page.goto('/greenhouse?scope=global')
    await expect(page.locator('[data-greenhouse-skeleton]')).toHaveCount(0, { timeout: 20_000 })
    const first = page.locator('[data-greenhouse]').first()
    test.skip((await first.count()) === 0, 'no other greenhouses on this data set')
    await first.click()
    await expect(page).toHaveURL(/\/greenhouse\/[^/?]+$/)
    await page.getByRole('main').getByRole('link', { name: 'Global' }).click()
    await expect(page).toHaveURL(/\/greenhouse\?scope=global/)
  })

  test('on the phone, a tap on the tasks chip opens it and a hold does not', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'The floating chip is phone only')
    await expectPage(page, '/home')
    const chip = page.getByRole('button', { name: 'Needs you today' })
    test.skip((await chip.count()) === 0, 'no care due for this member today')
    const sheet = page.getByRole('dialog', { name: 'Needs you today' })

    await press(chip, 600)
    await expect(sheet).toHaveCount(0)

    await press(chip, 60)
    await expect(sheet).toBeVisible()
  })
})
