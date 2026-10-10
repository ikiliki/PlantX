import { ADMIN, expect, expectPage, signIn, test } from './support'

/** One plant per passport: a plant has no quantity, so its passport shows no Quantity row. */
test.describe('one plant per passport', () => {
  test('the passport names the plant and shows no quantity', async ({ page }) => {
    await signIn(page, ADMIN)
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
      history: [],
    }
    // The plant exists only in this test: the list gets it appended, and its own routes are answered here.
    await page.route('**/api/plants', async (route) => {
      if (route.request().method() !== 'GET') return route.fallback()
      const body = (await (await route.fetch()).json()) as { plants: unknown[] }
      await route.fulfill({ json: { ...body, plants: [...body.plants, plant] } })
    })
    await page.route(`**/api/plants/${plant.id}**`, async (route) => {
      if (route.request().url().endsWith('/activities')) {
        return route.fulfill({ json: { plantId: plant.id, activities: [] } })
      }
      return route.fulfill({ json: { plant } })
    })

    await expectPage(page, `/plants/${plant.id}`)
    const passport = page.getByRole('dialog').first()
    await expect(passport.getByRole('heading', { name: plant.title })).toBeVisible()
    await expect(passport.getByText('Size', { exact: true }).first()).toBeVisible()
    await expect(passport.getByText('Quantity', { exact: true })).toHaveCount(0)
    await expect(passport.getByText(/×\d/)).toHaveCount(0)
  })
})
