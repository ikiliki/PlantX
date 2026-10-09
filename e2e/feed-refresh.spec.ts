import { MEMBER, expect, expectPage, signIn, test } from './support'

/** Home feed freshness (desktop; the phone refreshes with a pull). Signed in, read-only. */
test.describe('home feed refresh', () => {
  test('the feed says how fresh it is, and Refresh confirms it is up to date', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'phone', 'Phones refresh the feed with a pull, not the button')
    await signIn(page, MEMBER)
    await expectPage(page, '/home')

    const status = page.getByText(/^Updated (just now|\d+ (min|h) ago)$/)
    await expect(status).toBeVisible()

    await page.getByRole('button', { name: 'Refresh' }).click()
    await expect(page.getByText("You're up to date")).toBeVisible()
    await expect(page.getByText(/^Updated just now$/)).toBeVisible({ timeout: 8000 })
  })
})
