import { ADMIN, MEMBER, expect, expectPage, signIn, test } from './support'

/**
 * Phone popups and scroll (#82 #83 #84).
 * #82: a popup opened from the activity sheet keeps its taps; only its own close / Escape closes it.
 * #83: a page opened by a link starts at the top, not at the old scroll offset.
 * #84: your own greenhouse opens at /greenhouse/:id (not Global), and its avatar opens the profile preview.
 */

test.describe('activity sheet popups', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, ADMIN)
  })

  test('a passport opened from the bell keeps taps inside it; Escape closes only the passport', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'the bell is the phone greenhouse activity')
    const plant = {
      id: 'e2e-bell-plant',
      code: 'POT-GOLD-M-EST',
      ownerId: ADMIN,
      speciesId: 'sp-pothos',
      title: 'E2E bell pothos',
      titleHe: 'E2E bell pothos',
      photos: ['/class-photos/pot-gold-a-l-mat.jpg'],
      quantity: 1,
      sizeGrade: 'M',
      sizeBand: 'M',
      quality: '',
      rooting: 'established',
      stage: 'EST',
      locationZone: 'Unknown',
      locationZoneHe: 'לא ידוע',
      lat: 31.4,
      lng: 35.1,
      status: 'owned',
      createdAt: '2026-10-06',
      history: [],
    }
    const added = {
      id: 'e2e-bell-added',
      kind: 'added',
      userId: ADMIN,
      plantId: plant.id,
      body: `${plant.title} added`,
      bodyHe: `${plant.title} added`,
      createdAt: new Date().toISOString(),
    }
    let patched: Record<string, unknown> | null = null
    // The plant and its activity exist only in this test; nothing is written.
    await page.route('**/api/plants', async (route) => {
      if (route.request().method() !== 'GET') return route.fallback()
      const body = (await (await route.fetch()).json()) as { plants: unknown[] }
      await route.fulfill({ json: { ...body, plants: [...body.plants, plant] } })
    })
    await page.route('**/api/activities', async (route) => {
      if (route.request().method() !== 'GET') return route.fallback()
      const body = (await (await route.fetch()).json()) as { activities: unknown[] }
      await route.fulfill({ json: { ...body, activities: [...body.activities, added] } })
    })
    await page.route(`**/api/plants/${plant.id}**`, async (route) => {
      const request = route.request()
      if (request.url().endsWith('/activities')) return route.fulfill({ json: { plantId: plant.id, activities: [added] } })
      if (request.method() === 'PATCH') {
        patched = request.postDataJSON() as Record<string, unknown>
        return route.fulfill({ json: { plant: { ...plant, ...patched }, changed: ['private'] } })
      }
      return route.fulfill({ json: { plant } })
    })

    await expectPage(page, '/greenhouse')
    await page.getByRole('button', { name: 'Greenhouse activities' }).click()
    const sheet = page.getByRole('dialog', { name: 'Greenhouse activities' })
    await expect(sheet).toBeVisible()
    await sheet.getByRole('button', { name: new RegExp(plant.title) }).last().click()

    await page.getByRole('tab', { name: 'Settings' }).click()
    const privacy = page.getByRole('radiogroup', { name: 'Who can see this plant' })
    await expect(privacy).toBeVisible()
    await privacy.getByRole('radio', { name: 'Private' }).click()
    // The tap acted on the passport: it stayed open, and so did the sheet under it.
    await expect(privacy.getByRole('radio', { name: 'Private' })).toHaveAttribute('aria-checked', 'true')
    expect(patched).toEqual({ private: true })
    await expect(sheet).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(privacy).toHaveCount(0)
    await expect(sheet).toBeVisible()
  })
})

test.describe('scroll', { tag: '@prod' }, () => {
  test('a page opened by a link starts at the top', async ({ page }) => {
    await expectPage(page, '/wiki/sp-staghorn')
    // Every page is tall here, so a kept scroll offset would show.
    await page.addStyleTag({ content: 'main { min-height: 4000px !important; }' })
    await page.evaluate(() => window.scrollTo(0, 1500))
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000)
    // A script click: a pointer click would scroll the link into view first and hide a kept offset.
    await page.locator('main a[href="/wiki"]').first().evaluate((link) => (link as HTMLAnchorElement).click())
    await expect(page).toHaveURL(/\/wiki$/)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  })
})

test.describe('own greenhouse', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, MEMBER)
  })

  test('my greenhouse link opens my greenhouse, and its avatar opens my profile preview', async ({ page }) => {
    await expectPage(page, `/greenhouse/${MEMBER}`)
    // Before #84 this bounced to the Global list.
    await expect(page).toHaveURL(new RegExp(`/greenhouse/${MEMBER}$`))
    const header = page.getByRole('complementary', { name: /Greenhouse level/ })
    await expect(header).toBeVisible()
    await header.locator('[data-owner-avatar]').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`/greenhouse/${MEMBER}$`))
  })
})
