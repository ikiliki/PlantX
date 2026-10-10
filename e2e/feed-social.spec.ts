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
    // My own post names me with (you).
    await expect(card).toContainText('(you)')
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

  test('under the leaf: the two newest comments, View all, and a comment box (only the box with none)', async ({ page }) => {
    const at = new Date().toISOString()
    const c = (id: string, body: string) => ({ id, activityId: 'e2e-preview', userId: MEMBER, body, createdAt: at })
    const talked = {
      id: 'e2e-preview',
      kind: 'added',
      userId: MEMBER,
      body: 'e2e preview post',
      bodyHe: 'e2e preview post',
      createdAt: at,
      comments: 3,
      latestComments: [c('e2e-p2', 'Second comment'), c('e2e-p3', 'Third comment')],
    }
    const quiet = { ...talked, id: 'e2e-quiet', body: 'e2e quiet post', bodyHe: 'e2e quiet post', comments: 0, latestComments: [] }
    await page.route('**/api/activities', async (route) => {
      if (route.request().method() !== 'GET') return route.fallback()
      const res = await route.fetch()
      const body = (await res.json()) as { activities: unknown[] }
      await route.fulfill({ response: res, json: { activities: [talked, quiet, ...body.activities] } })
    })
    await page.route(`**/api/activities/${quiet.id}/comments`, async (route) => {
      const { body } = route.request().postDataJSON() as { body: string }
      await route.fulfill({ status: 201, json: { comment: { ...c('e2e-q1', body), activityId: quiet.id } } })
    })

    await expectPage(page, '/social')
    const preview = page.locator('[data-feed-post="e2e-preview"] [data-comment-preview]')
    await expect(preview.locator('[data-comment]')).toHaveCount(2)
    await expect(preview).toContainText('Third comment')
    await expect(preview.locator('[data-comments-all]')).toHaveText('View all 3 comments')

    // No comments yet: only the box. Sending shows the comment there at once.
    const empty = page.locator('[data-feed-post="e2e-quiet"] [data-comment-preview]')
    await expect(empty.locator('[data-comment]')).toHaveCount(0)
    await expect(empty.locator('[data-comments-all]')).toHaveCount(0)
    await empty.locator('[data-comment-field]').fill('Hello there')
    await empty.getByRole('button', { name: 'Send' }).click()
    await expect(empty.locator('[data-comment]')).toContainText('Hello there')
    await expect(empty.locator('[data-comment-field]')).toHaveValue('')
  })

  test('Greenhouse activities: Social lists every leaf and comment on my posts; the bell counts new ones', async ({ page }, testInfo) => {
    const at = new Date().toISOString()
    await page.route('**/api/activities/social/mine', (route) =>
      route.fulfill({
        json: {
          items: [
            { kind: 'comment', activityId: 'e2e-mine', plantId: null, userId: 'u-admin', userName: 'E2E Admin', body: 'Gorgeous leaves', createdAt: at },
            { kind: 'reaction', activityId: 'e2e-mine', plantId: null, userId: 'u-admin', userName: 'E2E Admin', body: '', createdAt: at },
            { kind: 'reaction', activityId: 'e2e-mine', plantId: null, userId: MEMBER, userName: 'Me', body: '', createdAt: at },
          ],
        },
      }),
    )
    await expectPage(page, '/greenhouse')
    if (testInfo.project.name === 'phone') {
      // Two new from another grower (my own leaf does not count); the bell opens on Social.
      const bell = page.getByRole('banner').locator('[data-activity-bell]')
      await expect(bell.locator('[data-bell-count]')).toHaveText('2')
      await bell.click()
    } else {
      const show = page.locator('[data-activity-thread]').getByRole('radiogroup', { name: 'Show' })
      await expect(show.getByRole('radio', { name: 'Social (2)' })).toBeVisible()
      await show.getByRole('radio', { name: /^Social/ }).click()
    }
    const thread = page.locator('[data-activity-thread]').last()
    await expect(thread.getByRole('radiogroup', { name: 'Show' }).getByRole('radio', { name: 'Social' })).toBeChecked()
    await expect(thread.getByText('E2E Admin commented: “Gorgeous leaves”')).toBeVisible()
    await expect(thread.getByText('E2E Admin gave your post a 🌿')).toBeVisible()
    await expect(thread.getByText('You gave your post a 🌿')).toBeVisible()
  })
})
