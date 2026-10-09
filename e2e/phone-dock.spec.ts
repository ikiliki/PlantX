import { expect, expectPage, test } from './support'

/** Phone dock and back to top. Signed out and read-only, so it also runs on production. */
test.describe('phone dock', { tag: '@prod' }, () => {
  test('the dock tucks away on scroll down and back to top takes its place, then brings it back', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'The floating dock is the phone navigation')
    await expectPage(page, '/wiki')
    const dock = page.locator('[data-dock]')
    const backToTop = page.getByRole('button', { name: 'Back to top' })

    await expect(dock).toHaveAttribute('data-dock', 'shown')
    await expect(backToTop).toHaveCount(0)

    // Scroll down in steps, like a reader, past the point where the dock may tuck away.
    for (let i = 0; i < 6; i++) {
      await page.evaluate(() => window.scrollBy(0, 300))
      await page.waitForTimeout(80)
    }
    const scrollable = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight > 400)
    test.skip(!scrollable, 'The catalog is too short on this data set to scroll')

    await expect(dock).toHaveAttribute('data-dock', 'away')
    await expect(backToTop).toBeVisible()

    await backToTop.click()
    await expect(dock).toHaveAttribute('data-dock', 'shown')
    await expect(backToTop).toHaveCount(0)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(160)
  })
})
