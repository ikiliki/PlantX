import type { Page } from '@playwright/test'
import { expect, expectPage, test } from './support'

/** Pull down from `y` with synthetic touches (the phone pull-to-refresh gesture). */
async function pullDown(page: Page, from: { x: number; y: number }) {
  await page.evaluate(async ({ x, y }) => {
    const target = document.elementFromPoint(x, y) ?? document.body
    const touch = (clientY: number) => new Touch({ identifier: 1, target, clientX: x, clientY })
    const fire = (type: string, clientY: number) =>
      target.dispatchEvent(
        new TouchEvent(type, {
          touches: type === 'touchend' ? [] : [touch(clientY)],
          changedTouches: [touch(clientY)],
          bubbles: true,
        }),
      )
    fire('touchstart', y)
    for (let step = y + 20; step <= y + 240; step += 20) {
      fire('touchmove', step)
      await new Promise((resolve) => requestAnimationFrame(resolve))
    }
    fire('touchend', y + 240)
  }, from)
}

/** Popups: back closes them, the page behind stays put, a pull inside them never refreshes the page. */
test.describe('popups', { tag: '@prod' }, () => {
  test('back closes the open popup instead of leaving the page', async ({ page }) => {
    await expectPage(page, '/wiki')
    await expectPage(page, '/greenhouse')
    await page.getByRole('button', { name: /try adding a plant/i }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await page.goBack()
    await expect(dialog).toHaveCount(0)
    await expect(page).toHaveURL(/\/greenhouse$/)

    // The next back leaves the page as usual.
    await page.goBack()
    await expect(page).toHaveURL(/\/wiki$/)
  })

  test('the page behind an open popup does not scroll', async ({ page }) => {
    await expectPage(page, '/greenhouse')
    await page.getByRole('button', { name: /try adding a plant/i }).first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('data-layer-open', 'true')
    await expect(page.locator('html')).toHaveCSS('overflow-y', 'hidden')

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.locator('html')).not.toHaveAttribute('data-layer-open', 'true')
  })

  test('a pull inside a popup does not refresh the page under it', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'Pull to refresh is the phone gesture')
    await expectPage(page, '/greenhouse')
    await page.getByRole('button', { name: /try adding a plant/i }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    const box = await dialog.boundingBox()
    await pullDown(page, { x: (box?.x ?? 0) + (box?.width ?? 0) / 2, y: (box?.y ?? 0) + 40 })
    await expect(page.getByRole('status', { name: 'Refreshing' })).toHaveCount(0)
    await expect(dialog).toBeVisible()
  })
})
