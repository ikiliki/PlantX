import type { Page } from '@playwright/test'
import { ADMIN, MEMBER, expect, expectPage, signIn, test } from './support'

/**
 * Passport layout: one plant per passport (no quantity), tabs Story / Tasks / Settings with Story first,
 * and the class code under the name. A plant's activity is private to its grower (and admins) for now.
 */
const plant = {
  id: 'e2e-one-plant',
  code: 'POT-GOLD-M-EST',
  ownerId: ADMIN,
  speciesId: 'sp-pothos',
  title: 'E2E single pothos',
  titleHe: 'E2E single pothos',
  photos: ['/class-photos/pot-gold-a-l-mat.jpg'],
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
  createdAt: '2026-10-10',
  history: [{ at: '2026-10-10', label: 'E2E history entry', labelHe: 'E2E history entry' }],
}

const added = {
  id: 'e2e-one-plant-added',
  kind: 'added',
  userId: ADMIN,
  plantId: plant.id,
  body: `${plant.title} added`,
  bodyHe: `${plant.title} added`,
  createdAt: new Date().toISOString(),
}

/** The plant and its public "added" activity exist only in this test; nothing is written. */
async function servePlant(page: Page) {
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
    if (route.request().url().endsWith('/activities')) {
      return route.fulfill({ json: { plantId: plant.id, activities: [added] } })
    }
    return route.fulfill({ json: { plant } })
  })
}

test.describe('plant passport', () => {
  test('opens on its story, names one plant, and shows no quantity', async ({ page }) => {
    await signIn(page, ADMIN)
    await servePlant(page)
    await expectPage(page, `/plants/${plant.id}`)
    const passport = page.getByRole('dialog').first()
    await expect(passport.getByRole('heading', { name: plant.title })).toBeVisible()

    // Story leads and is open; the old Grading / Activity tabs are gone.
    const tabs = passport.getByRole('tablist')
    await expect(tabs.getByRole('tab').first()).toHaveText('Story')
    await expect(tabs.getByRole('tab', { name: 'Story' })).toHaveAttribute('aria-selected', 'true')
    await expect(tabs.getByRole('tab', { name: 'User rank' })).toHaveCount(0)
    await expect(tabs.getByRole('tab', { name: 'Activity' })).toHaveCount(0)
    await expect(tabs.getByRole('tab', { name: 'Settings' })).toBeVisible()

    // The grower sees the activity, and is told it is theirs alone.
    await expect(passport.locator('[data-passport-story]')).toContainText(added.body)
    await expect(passport.locator('[data-passport-story-note="grower"]')).toContainText(
      "Only you can see this plant's activity for now.",
    )

    // One plant: no quantity anywhere, and the class code is still on the passport.
    await expect(passport.getByText('Size', { exact: true }).first()).toBeVisible()
    await expect(passport.getByText('Quantity', { exact: true })).toHaveCount(0)
    await expect(passport.getByText(/×\d/)).toHaveCount(0)
    await expect(passport.getByText(plant.code, { exact: true })).toBeVisible()
  })

  test("another grower's passport keeps its activity private and says so", async ({ page }) => {
    await signIn(page, MEMBER)
    await servePlant(page)
    await expectPage(page, `/plants/${plant.id}`)
    const passport = page.getByRole('dialog').first()
    await expect(passport.getByRole('heading', { name: plant.title })).toBeVisible()
    await expect(passport.locator('[data-passport-story-note="private"]')).toContainText('is private to')
    await expect(passport.getByText(added.body)).toHaveCount(0)
    await expect(passport.getByText('E2E history entry')).toHaveCount(0)
  })

  test("the API gives no other grower's plant activity", async ({ page }) => {
    await signIn(page, MEMBER)
    const { plants } = (await (await page.request.get('/api/plants')).json()) as {
      plants: { id: string; ownerId: string }[]
    }
    const theirs = plants.find((item) => item.ownerId !== MEMBER)
    test.skip(!theirs, 'no other grower has a plant here')
    const byQuery = await page.request.get(`/api/activities?plantId=${theirs!.id}`)
    expect(((await byQuery.json()) as { activities: unknown[] }).activities).toEqual([])
    const byPlant = await page.request.get(`/api/plants/${theirs!.id}/activities`)
    expect(((await byPlant.json()) as { activities: unknown[] }).activities).toEqual([])
  })
})
