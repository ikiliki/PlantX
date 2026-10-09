import { MEMBER, expect, expectPage, signIn, test } from './support'

/** Phone Home redesign: Feed tab in the dock, Market last, catalog as a top bar icon, the daily Home, the Feed page. */
test.describe('phone navigation', { tag: '@prod' }, () => {
  test('the dock has Feed, Market last and no Catalog; Catalog is a top bar icon', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'The dock is the phone navigation')
    await expectPage(page, '/greenhouse')
    const dock = page.locator('[data-dock]')
    await expect(dock.locator('a[href="/feed"]')).toBeVisible()
    // Market, when it is on, is the last dock item.
    const market = dock.locator('a[href="/market"]')
    if ((await market.count()) > 0) await expect(dock.locator('a').last()).toHaveAttribute('href', '/market')
    await expect(dock.locator('a[href="/wiki"]')).toHaveCount(0)

    await page.getByRole('banner').getByRole('link', { name: 'Catalog' }).click()
    await expect(page).toHaveURL(/\/wiki/)
  })

  test('a guest on Feed sees blurred posts under a log-in card, like Tasks', async ({ page }) => {
    await expectPage(page, '/feed')
    await expect(page.getByText("Log in to see what's growing")).toBeVisible()
    await expect(page.getByRole('button', { name: /try adding a plant/i })).toBeVisible()
    // Nothing real behind the card: placeholder posts only.
    await expect(page.locator('[data-feed-post]')).toHaveCount(0)
  })
})

test.describe('member Home and Feed', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, MEMBER)
  })

  test('phone Home opens with a greeting and short sections, not the endless feed', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'Desktop keeps the three-column Home')
    await expectPage(page, '/home')
    const home = page.locator('[data-home-today]')
    await expect(home).toBeVisible()
    await expect(home.getByRole('heading', { level: 1 })).toHaveText(/^Good (morning|afternoon|evening), /)
    // Either the first-plant card or the grower's own plants, then at most two feed items with a link to Feed.
    await expect(home.locator('[data-home-first], [data-home-greenhouse]').first()).toBeVisible()
    expect(await home.locator('[data-feed-update]').count()).toBeLessThanOrEqual(2)
    await home.getByRole('link', { name: 'Feed' }).click()
    await expect(page).toHaveURL(/\/feed$/)
  })

  test('Feed shows activities as photo posts with filters and catalog cards mixed in', async ({ page }) => {
    const at = new Date().toISOString()
    const extra = Array.from({ length: 5 }, (_, index) => ({
      id: `e2e-feed-${index}`,
      kind: index === 0 ? 'added' : 'water',
      userId: 'u-admin',
      body: `e2e feed post ${index}`,
      bodyHe: `e2e feed post ${index}`,
      createdAt: new Date(Date.parse(at) - index * 1000).toISOString(),
    }))
    await page.route('**/api/activities', async (route) => {
      if (route.request().method() !== 'GET') return route.fallback()
      const res = await route.fetch()
      const body = (await res.json()) as { activities: unknown[] }
      await route.fulfill({ response: res, json: { activities: [...extra, ...body.activities] } })
    })
    await expectPage(page, '/feed')
    const feed = page.locator('[data-feed-page]')
    await expect(feed.locator('[data-feed-post="e2e-feed-0"]')).toContainText('e2e feed post 0')
    await expect(feed.locator('[data-feed-post="e2e-feed-0"]')).toContainText('+50 XP')
    // A suggestion card follows every fourth post.
    await expect(feed.locator('[data-feed-suggestion]').first()).toBeVisible()

    await feed.getByRole('tab', { name: /New plants/ }).click()
    await expect(feed.locator('[data-feed-post="e2e-feed-0"]')).toBeVisible()
    await expect(feed.locator('[data-feed-post="e2e-feed-1"]')).toHaveCount(0)
  })

  test('the activity bell shows on the Greenhouse page only and opens a sheet grouped by day', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'The bell is the phone way into greenhouse activity')
    const bell = page.getByRole('banner').getByRole('button', { name: 'Greenhouse activities' })
    await expectPage(page, '/home')
    await expect(bell).toHaveCount(0)
    await expectPage(page, '/greenhouse')
    await bell.click()
    const sheet = page.getByRole('dialog', { name: 'Greenhouse activities' })
    await expect(sheet).toBeVisible()
    await expect(sheet.getByRole('radio', { name: 'XP' })).toBeChecked()
    await page.keyboard.press('Escape')
    await expect(sheet).toHaveCount(0)
  })

  test('the account dialog splits into Profile, Appearance and Account tabs', async ({ page }) => {
    await page.goto('/greenhouse?account=1')
    const dialog = page.getByRole('dialog', { name: 'Account' })
    await expect(dialog.getByRole('tab', { name: 'Profile' })).toHaveAttribute('aria-selected', 'true')
    await expect(dialog.getByLabel('Nickname')).toBeVisible()

    await dialog.getByRole('tab', { name: 'Appearance' }).click()
    await expect(dialog.getByRole('radio', { name: 'Night garden' })).toBeVisible()
    await expect(dialog.getByLabel('Nickname')).toHaveCount(0)

    await dialog.getByRole('tab', { name: 'Account' }).click()
    await expect(dialog.getByRole('button', { name: 'Sign out' })).toBeVisible()
  })
})
