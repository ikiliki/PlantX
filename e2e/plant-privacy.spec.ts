import { ADMIN, MEMBER, expect, expectPage, signIn, test } from './support'

/**
 * Plant privacy, owner delete, and the owner's private edit / delete activity.
 * The CI seed (scripts/e2e-seed.mjs) gives the admin one private plant, e2e-private-plant, with an
 * `added` activity; elsewhere (PP) those checks skip.
 */
const PRIVATE_PLANT = 'e2e-private-plant'

test.describe('another grower', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, MEMBER)
  })

  test("a private plant and its activity never reach another member", async ({ page }) => {
    const list = await page.request.get('/api/plants')
    expect(list.ok()).toBeTruthy()
    const { plants } = (await list.json()) as { plants: { id: string }[] }
    expect(plants.some((plant) => plant.id === PRIVATE_PLANT)).toBe(false)
    const one = await page.request.get(`/api/plants/${PRIVATE_PLANT}`)
    expect(one.status()).toBe(404)
    const feed = await page.request.get('/api/activities')
    const { activities } = (await feed.json()) as { activities: { plantId?: string; kind: string; userId: string }[] }
    expect(activities.some((item) => item.plantId === PRIVATE_PLANT)).toBe(false)
    // Edit and delete rows are the owner's own log: never another member's.
    expect(activities.some((item) => (item.kind === 'edited' || item.kind === 'deleted') && item.userId !== MEMBER)).toBe(false)
  })

  test("a member cannot make another grower's plant private, delete it, or write edit activity", async ({ page }) => {
    const list = await page.request.get('/api/plants')
    const { plants } = (await list.json()) as { plants: { id: string; ownerId: string }[] }
    const theirs = plants.find((plant) => plant.ownerId !== MEMBER)
    test.skip(!theirs, 'no other grower has a plant here')
    const patched = await page.request.patch(`/api/plants/${theirs!.id}`, { data: { private: true } })
    expect(patched.status()).toBe(403)
    const deleted = await page.request.delete(`/api/plants/${theirs!.id}`)
    expect(deleted.status()).toBe(403)
    const forged = await page.request.post('/api/activities', { data: { kind: 'edited', body: 'x', bodyHe: 'x' } })
    expect(forged.status()).toBe(400)
  })
})

test.describe('owner', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, ADMIN)
  })

  test('the owner still reads their private plant and its activity', async ({ page }) => {
    const one = await page.request.get(`/api/plants/${PRIVATE_PLANT}`)
    test.skip(!one.ok(), 'the private plant is seeded only on the CI QA stack')
    expect(((await one.json()) as { plant: { private?: boolean } }).plant.private).toBe(true)
    const feed = await page.request.get(`/api/activities?plantId=${PRIVATE_PLANT}`)
    const { activities } = (await feed.json()) as { activities: { id: string }[] }
    expect(activities.some((item) => item.id === 'e2e-private-added')).toBe(true)
  })

  test("an edit writes a private 'edited' activity in the owner's log", async ({ page }) => {
    const one = await page.request.get(`/api/plants/${PRIVATE_PLANT}`)
    test.skip(!one.ok(), 'the private plant is seeded only on the CI QA stack')
    const title = `E2E private pothos ${Date.now()}`
    const patched = await page.request.patch(`/api/plants/${PRIVATE_PLANT}`, { data: { title } })
    expect(patched.ok()).toBeTruthy()
    const feed = await page.request.get(`/api/activities?plantId=${PRIVATE_PLANT}`)
    const { activities } = (await feed.json()) as { activities: { kind: string; body: string }[] }
    expect(activities.some((item) => item.kind === 'edited' && item.body === `Edited ${title}: name`)).toBe(true)
  })

  test('the owner makes a plant private, then deletes it after confirming', async ({ page }) => {
    const plant = {
      id: 'e2e-owner-plant',
      code: 'POT-GOLD-M-EST',
      ownerId: ADMIN,
      speciesId: 'sp-pothos',
      title: 'E2E owner pothos',
      titleHe: 'E2E owner pothos',
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
    let patched: Record<string, unknown> | null = null
    let deleted = false
    // The plant exists only in this test: the list gets it appended, and its own routes are answered here.
    await page.route('**/api/plants', async (route) => {
      if (route.request().method() !== 'GET') return route.fallback()
      const res = await route.fetch()
      const body = (await res.json()) as { plants: unknown[] }
      await route.fulfill({ json: { ...body, plants: [...body.plants, plant] } })
    })
    await page.route(`**/api/plants/${plant.id}**`, async (route) => {
      const request = route.request()
      if (request.url().endsWith('/activities')) return route.fulfill({ json: { plantId: plant.id, activities: [] } })
      if (request.method() === 'PATCH') {
        patched = request.postDataJSON() as Record<string, unknown>
        return route.fulfill({ json: { plant: { ...plant, ...patched }, changed: ['private'] } })
      }
      if (request.method() === 'DELETE') {
        deleted = true
        return route.fulfill({
          json: {
            plantId: plant.id,
            activity: {
              id: 'e2e-deleted',
              kind: 'deleted',
              userId: ADMIN,
              body: `Deleted ${plant.title} from the greenhouse`,
              bodyHe: `${plant.title} נמחק מהחממה`,
              createdAt: new Date().toISOString(),
            },
          },
        })
      }
      return route.fulfill({ json: { plant } })
    })

    await expectPage(page, `/plants/${plant.id}`)
    const passport = page.getByRole('dialog').first()
    const privacy = passport.getByRole('radiogroup', { name: 'Who can see this plant' })
    await expect(privacy.getByRole('radio', { name: 'Public' })).toHaveAttribute('aria-checked', 'true')

    await privacy.getByRole('radio', { name: 'Private' }).click()
    await expect(privacy.getByRole('radio', { name: 'Private' })).toHaveAttribute('aria-checked', 'true')
    // What each side means is its tooltip, not a line of text.
    await expect(privacy.getByRole('radio', { name: 'Private' })).toHaveAttribute('title', 'Only you see this plant and its activity.')
    expect(patched).toEqual({ private: true })

    // Delete asks first; Cancel keeps the plant.
    await passport.getByRole('button', { name: 'Delete plant' }).click()
    const confirm = page.getByRole('dialog', { name: `Delete ${plant.title}?` })
    // The footer Cancel (the corner × may share the name until #79).
    await confirm.getByRole('button', { name: 'Cancel' }).last().click()
    await expect(confirm).toHaveCount(0)
    expect(deleted).toBe(false)

    await passport.getByRole('button', { name: 'Delete plant' }).click()
    await confirm.getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(page).toHaveURL(/\/greenhouse$/)
    expect(deleted).toBe(true)
    await expect(page.getByRole('link', { name: plant.title })).toHaveCount(0)
  })
})
