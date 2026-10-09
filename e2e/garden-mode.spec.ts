import { expect, expectPage, test } from './support'

/**
 * Sunny garden ↔ night garden, chosen under Settings → Appearance (a guest opens it from the top bar gear).
 * Signed out; only the browser's own storage changes, so it also runs on production.
 */
test.describe('garden mode', { tag: '@prod' }, () => {
  test('Settings switches to the night garden, keeps it after a reload, and switches back', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
    await expectPage(page, '/greenhouse')
    const html = page.locator('html')
    const openSettings = async () => {
      await page.getByRole('banner').getByRole('button', { name: 'Settings' }).click()
      return page.getByRole('dialog', { name: 'Settings' })
    }

    let settings = await openSettings()
    await settings.getByRole('radio', { name: 'Night garden' }).click()
    await expect(html).toHaveAttribute('data-theme', 'night')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(36, 51, 43)')

    await page.reload()
    await expect(html).toHaveAttribute('data-theme', 'night')
    settings = await openSettings()
    await expect(settings.getByRole('radio', { name: 'Night garden' })).toHaveAttribute('aria-checked', 'true')

    await settings.getByRole('radio', { name: 'Sunny garden' }).click()
    await expect(html).toHaveAttribute('data-theme', 'day')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(244, 241, 232)')
  })

  test('the sunny garden is the default, even on a dark device', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await expectPage(page, '/greenhouse')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(244, 241, 232)')
    await page.getByRole('banner').getByRole('button', { name: 'Settings' }).click()
    await expect(page.getByRole('dialog', { name: 'Settings' }).getByRole('radio', { name: 'Sunny garden' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })
})
