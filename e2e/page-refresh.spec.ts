import type { Page } from '@playwright/test'
import { expect, expectPage, test } from './support'

/** Pull down from the top of the page with synthetic touches (the phone pull-to-refresh gesture). */
async function pullDown(page: Page) {
  await page.evaluate(async () => {
    window.scrollTo(0, 0)
    const touch = (y: number) => new Touch({ identifier: 1, target: document.body, clientX: 180, clientY: y })
    const fire = (type: string, y: number) =>
      window.dispatchEvent(
        new TouchEvent(type, { touches: type === 'touchend' ? [] : [touch(y)], changedTouches: [touch(y)], bubbles: true }),
      )
    fire('touchstart', 120)
    for (let y = 140; y <= 360; y += 20) {
      fire('touchmove', y)
      await new Promise((resolve) => requestAnimationFrame(resolve))
    }
    fire('touchend', 360)
  })
}

/** Phone pull to refresh on pages other than Home. Signed out and read-only, so it also runs on production. */
test.describe('page pull to refresh', { tag: '@prod' }, () => {
  test('pulling down on the catalog refetches it and shows the refresh spinner', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'Pull to refresh is the phone gesture')
    await expectPage(page, '/wiki')
    await pullDown(page)
    await expect(page.getByRole('status', { name: 'Refreshing' })).toBeVisible()
    await expect(page.getByRole('status', { name: 'Refreshing' })).toHaveCount(0, { timeout: 10_000 })
    await expect(page.locator('main')).not.toHaveText(/^\s*$/)
  })
})
