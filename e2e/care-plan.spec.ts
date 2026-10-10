import { ADMIN, expect, expectPage, signIn, test } from './support'

/**
 * Care plans: the passport Tasks tab lists one row per kind of care (water, photo, feed, repot) with its
 * next due day, and the owner changes a kind's interval with the pencil (PATCH /api/plants/:id { care }).
 */
const plant = {
  id: 'e2e-care-plant',
  code: 'POT-GOLD-M-EST',
  ownerId: ADMIN,
  speciesId: 'sp-pothos',
  title: 'E2E care pothos',
  titleHe: 'E2E care pothos',
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
  createdAt: '2026-10-01',
  history: [],
}

const day = (offset: number) => {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + offset)
  return date.toISOString().slice(0, 10)
}

const todo = (id: string, subcategory: string, dueOn: string | null, completedOn: string | null = null) => ({
  id,
  ownerId: ADMIN,
  plantId: plant.id,
  category: 'plant',
  subcategory,
  dueOn,
  completedOn,
  createdAt: '2026-10-01T10:00:00.000Z',
})

const todos = [
  todo('e2e-care-water-done', 'water', day(-7), day(-7)),
  todo('e2e-care-water', 'water', day(0)),
  todo('e2e-care-photo', 'photo', day(20)),
  todo('e2e-care-feed', 'feed', day(-2)),
  todo('e2e-care-repot', 'repot', day(300)),
]

test.describe('care plan', () => {
  test('the passport shows every kind of care and the owner changes an interval', async ({ page }) => {
    await signIn(page, ADMIN)
    let patched: Record<string, unknown> | null = null
    // The plant and its tasks exist only in this test; the care change is answered here, nothing is written.
    await page.route('**/api/plants', async (route) => {
      if (route.request().method() !== 'GET') return route.fallback()
      const body = (await (await route.fetch()).json()) as { plants: unknown[] }
      await route.fulfill({ json: { ...body, plants: [...body.plants, plant] } })
    })
    await page.route('**/api/todos', async (route) => {
      if (route.request().method() !== 'GET') return route.fallback()
      const body = (await (await route.fetch()).json()) as { todos: unknown[] }
      await route.fulfill({ json: { ...body, todos: [...body.todos, ...todos] } })
    })
    await page.route(`**/api/plants/${plant.id}**`, async (route) => {
      const request = route.request()
      if (request.url().endsWith('/activities')) return route.fulfill({ json: { plantId: plant.id, activities: [] } })
      if (request.method() === 'PATCH') {
        patched = request.postDataJSON() as Record<string, unknown>
        return route.fulfill({ json: { plant: { ...plant, ...patched }, changed: ['care'] } })
      }
      return route.fulfill({ json: { plant } })
    })

    await expectPage(page, `/plants/${plant.id}`)
    const passport = page.getByRole('dialog').first()
    const tasksTab = passport.getByRole('tab', { name: 'Tasks' })
    test.skip((await tasksTab.count()) === 0, 'the passport Tasks tab is off here')
    await tasksTab.click()

    for (const kind of ['water', 'photo', 'feed', 'repot']) {
      await expect(passport.locator(`[data-care-kind="${kind}"]`)).toBeVisible()
    }
    await expect(passport.locator('[data-care-kind="water"]')).toContainText('Due today')
    await expect(passport.locator('[data-care-kind="feed"]')).toContainText('2d overdue')
    // Rotate is off by default; the owner still sees it, to turn it on.
    await expect(passport.locator('[data-care-kind="rotate"]')).toContainText('Off')

    await passport.getByRole('button', { name: 'Edit Water' }).click()
    const editor = page.getByRole('dialog', { name: 'Edit Water' })
    await editor.getByText('Every 3 days', { exact: true }).click()
    await editor.getByRole('button', { name: 'Save' }).click()
    await expect.poll(() => patched).not.toBeNull()
    expect(patched!.care).toEqual({ water: { everyDays: 3 } })
  })
})
