import { expect, expectPage, test } from './support'

/** Sunny garden ↔ night garden. Signed out; only the browser's own storage changes, so it also runs on production. */
test.describe('garden mode', { tag: '@prod' }, () => {
  test('the toggle switches to the night garden, keeps it after a reload, and switches back', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
    await expectPage(page, '/greenhouse')
    const html = page.locator('html')

    await page.getByRole('banner').getByRole('button', { name: 'Switch to the night garden' }).click()
    await expect(html).toHaveAttribute('data-theme', 'night')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(15, 26, 21)')

    await page.reload()
    await expect(html).toHaveAttribute('data-theme', 'night')
    const toDay = page.getByRole('banner').getByRole('button', { name: 'Switch to the sunny garden' })
    await expect(toDay).toBeVisible()

    await toDay.click()
    await expect(html).toHaveAttribute('data-theme', 'day')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 248, 236)')
  })

  test('a dark device with no choice opens in the night garden', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await expectPage(page, '/greenhouse')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(15, 26, 21)')
    await expect(page.getByRole('banner').getByRole('button', { name: 'Switch to the sunny garden' })).toBeVisible()
  })
})
