import { MEMBER, expect, expectPage, signIn, test } from './support'

/**
 * Feed 🌿 reactions and comments. Every write is answered here, so nothing is stored on the server.
 * Phone opens comments in a sheet, desktop under the post; both render the same thread.
 */
test.describe('feed reactions and comments', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, MEMBER)
  })

  test('the leaf toggles once per person, and comments can be added and removed', async ({ page }) => {
    const at = new Date().toISOString()
    const post = {
      id: 'e2e-social',
      kind: 'added',
      userId: MEMBER,
      body: 'e2e social post',
      bodyHe: 'e2e social post',
      createdAt: at,
      reactions: 2,
      reacted: false,
      comments: 1,
    }
    let reacted = false
    const comments = [{ id: 'e2e-c1', activityId: post.id, userId: MEMBER, body: 'First!', createdAt: at }]

    await page.route('**/api/activities', async (route) => {
      if (route.request().method() !== 'GET') return route.fallback()
      const res = await route.fetch()
      const body = (await res.json()) as { activities: unknown[] }
      await route.fulfill({ response: res, json: { activities: [post, ...body.activities] } })
    })
    await page.route(`**/api/activities/${post.id}/reaction`, async (route) => {
      reacted = route.request().method() === 'PUT'
      await route.fulfill({ json: { reactions: 2 + (reacted ? 1 : 0), reacted } })
    })
    await page.route(`**/api/activities/${post.id}/comments`, async (route) => {
      if (route.request().method() === 'POST') {
        const { body } = route.request().postDataJSON() as { body: string }
        const comment = { id: `e2e-c${comments.length + 1}`, activityId: post.id, userId: MEMBER, body, createdAt: at }
        comments.push(comment)
        return route.fulfill({ status: 201, json: { comment } })
      }
      await route.fulfill({ json: { comments } })
    })
    await page.route('**/api/comments/*', async (route) => {
      const id = route.request().url().split('/').pop()
      const index = comments.findIndex((comment) => comment.id === id)
      if (index >= 0) comments.splice(index, 1)
      await route.fulfill({ json: { ok: true } })
    })

    await expectPage(page, '/feed')
    const card = page.locator(`[data-feed-post="${post.id}"]`)
    const leaf = card.locator('[data-react]')
    await expect(leaf).toContainText('2')
    await expect(leaf).toHaveAttribute('aria-pressed', 'false')

    await leaf.click()
    await expect(leaf).toHaveAttribute('aria-pressed', 'true')
    await expect(leaf).toContainText('3')
    // A quick double tap ends where it started: never two leaves from one person, never below the start.
    await leaf.dblclick()
    await expect(leaf).toHaveAttribute('aria-pressed', 'true')
    await expect(leaf).toContainText('3')
    await leaf.click()
    await expect(leaf).toHaveAttribute('aria-pressed', 'false')
    await expect(leaf).toContainText('2')

    await card.locator('[data-comments-toggle]').click()
    const thread = page.locator('[data-comment-thread]')
    await expect(thread.getByText('First!')).toBeVisible()
    const send = thread.getByRole('button', { name: 'Send' })
    const box = thread.getByRole('textbox', { name: 'Say something nice' })
    await box.fill('   ')
    await expect(send).toBeDisabled()
    await box.fill('Lovely')
    await send.click()
    await expect(thread.getByText('Lovely')).toBeVisible()
    await expect(page.locator('[data-comments-toggle]').first()).toContainText('2 comments')

    await thread.locator('[data-comment="e2e-c2"]').getByRole('button', { name: 'Delete' }).click()
    await expect(thread.getByText('Lovely')).toHaveCount(0)
  })
})
