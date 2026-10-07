import { expect, expectPage, test } from './support'

/** Quick jump (modern direction). Signed out and read-only, so it also runs against production. */
test.describe('command palette', { tag: '@prod' }, () => {
  test('opens from the top bar and from Ctrl+K, filters, jumps, and closes with Escape', async ({ page }) => {
    await expectPage(page, '/greenhouse')

    const trigger = page.getByRole('banner').getByRole('button', { name: 'Search' })
    await trigger.click()
    const palette = page.getByRole('dialog', { name: 'Search' })
    await expect(palette).toBeVisible()
    await expect(palette.getByRole('option').first()).toBeVisible()

    await palette.getByRole('combobox').fill('zzzz-no-such-plant')
    await expect(palette.getByText('Nothing matches that. Try a plant name.')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(palette).toBeHidden()
    await expect(trigger).toBeFocused()

    await page.keyboard.press('Control+k')
    await expect(palette).toBeVisible()
    await palette.getByRole('combobox').fill('Global')
    await expect(palette.getByRole('option', { name: 'Global' })).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/greenhouse\?scope=global/)
    await expect(palette).toBeHidden()
  })
})
