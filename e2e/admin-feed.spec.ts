import { expect, expectPage, signIn, test } from './support'

/** Admin side of the Feed: its own page in System, and Moderation → Comments. Writes are answered here. */
test.describe('admin feed', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('System lists Feed as its own page', async ({ page }) => {
    await expectPage(page, '/admin/system')
    await expect(page.getByText('Feed', { exact: true }).first()).toBeVisible()
  })

  test('Server shows the reactions table and 🌿 / 💬 counts on activities', async ({ page }) => {
    const reactions = [
      { activityId: 'e2e-post', userId: 'e2e-member', userName: 'E2E Member', createdAt: new Date().toISOString(), postBody: 'e2e liked post', postUserId: 'u-admin' },
    ]
    await page.route('**/api/admin/reactions', (route) => route.fulfill({ json: { reactions } }))
    await expectPage(page, '/admin/server')
    const row = page.getByRole('row').filter({ hasText: 'e2e liked post' })
    await expect(row).toBeVisible()
    await expect(row).toContainText('E2E Member')
  })

  test('Moderation lists the newest comments and removes one', async ({ page }) => {
    const comments = [
      {
        id: 'e2e-admin-c1',
        activityId: 'e2e-post',
        userId: 'e2e-member',
        authorName: 'E2E Member',
        body: 'e2e rude comment',
        createdAt: new Date().toISOString(),
        postBody: 'e2e post body',
        postUserId: 'u-admin',
      },
    ]
    let removed = ''
    await page.route('**/api/admin/comments', (route) => route.fulfill({ json: { comments } }))
    await page.route('**/api/comments/*', async (route) => {
      removed = route.request().url().split('/').pop() ?? ''
      await route.fulfill({ json: { ok: true } })
    })

    await expectPage(page, '/admin/moderation')
    const row = page.getByRole('row').filter({ hasText: 'e2e rude comment' })
    await expect(row).toBeVisible()
    await expect(row).toContainText('E2E Member')
    await row.getByRole('button', { name: 'Remove' }).click()
    await expect(page.getByText('e2e rude comment')).toHaveCount(0)
    expect(removed).toBe('e2e-admin-c1')
  })
})
