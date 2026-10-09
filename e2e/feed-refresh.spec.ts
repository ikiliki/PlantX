import { MEMBER, expect, expectPage, signIn, test } from './support'

/** Feed refresh on desktop (the phone refreshes with a pull). Signed in, read-only. */
test.describe('feed refresh', () => {
  test('the Feed tab has a Refresh button that reloads the posts', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'phone', 'Phones refresh the feed with a pull, not the button')
    await signIn(page, MEMBER)
    await expectPage(page, '/feed')

    const refresh = page.getByRole('button', { name: 'Refresh' })
    await expect(refresh).toBeVisible()
    const reload = page.waitForRequest((request) => request.url().includes('/api/activities') && request.method() === 'GET')
    await refresh.click()
    await reload
    await expect(refresh).toBeEnabled()
  })
})
