import { ADMIN, MEMBER, expect, expectPage, signIn, test } from './support'

/** UX batch: Global loading (#77), scan allowance (#72), admin actions in one place (#71), inline edit (#70). */

const resetsAt = () => new Date(Date.now() + 3_600_000).toISOString()

test.describe('member', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, MEMBER)
  })

  test('settings shows the daily AI scan allowance', async ({ page }) => {
    await page.route('**/api/identify/quota', (route) =>
      route.fulfill({ json: { quota: { used: 1, limit: 3, extra: 0, remaining: 2, resetsAt: resetsAt() } } }),
    )
    await expectPage(page, '/settings')
    const meter = page.locator('[data-scan-quota]').first()
    await expect(meter).toContainText('2 of 3 left')
    // Tapping the tile says when the scans reset.
    await meter.click()
    await expect(meter).toContainText('Resets at midnight')
  })

  test('the greenhouse header holds the AI scan tile', async ({ page }) => {
    await page.route('**/api/identify/quota', (route) =>
      route.fulfill({ json: { quota: { used: 1, limit: 3, extra: 0, remaining: 2, resetsAt: resetsAt() } } }),
    )
    await expectPage(page, '/greenhouse')
    const header = page.getByRole('complementary', { name: /Greenhouse level/ })
    await expect(header.locator('[data-scan-quota]')).toContainText('2 of 3 left')
  })

  test('Global shows grower placeholders while the list loads, never the empty state first', async ({ page }) => {
    let release: () => void = () => undefined
    const held = new Promise<void>((resolve) => (release = resolve))
    await page.route('**/api/users/directory', async (route) => {
      await held
      await route.fallback()
    })
    await page.goto('/greenhouse?scope=global')
    await expect(page.locator('[data-greenhouse-skeleton]').first()).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText('No greenhouses match')).toHaveCount(0)
    release()
    await expect(page.locator('[data-greenhouse-skeleton]')).toHaveCount(0, { timeout: 20_000 })
    // Then either grower cards or, on an empty stack, the honest empty state.
    await expect(page.locator('[data-greenhouse]').first().or(page.getByText('No greenhouses match'))).toBeVisible()
  })
})

test.describe('admin', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, ADMIN)
  })

  test('the admin sees unlimited AI scans', async ({ page }) => {
    await expectPage(page, '/settings')
    await expect(page.locator('[data-scan-quota="unlimited"]').first()).toBeVisible()
  })

  test('Server users are read-only; Moderation has the user actions', async ({ page }) => {
    await expectPage(page, '/admin/server')
    const users = page.locator('#server-users')
    await expect(users).toBeVisible()
    for (const name of ['Disable', 'Scans', 'Verify greenhouse', 'Hide', 'Delete']) {
      await expect(users.getByRole('button', { name, exact: true })).toHaveCount(0)
    }

    await expectPage(page, '/admin/moderation')
    for (const name of ['Edit', 'Scans', 'Hide', 'Delete']) {
      await expect(page.getByRole('button', { name, exact: true }).first()).toBeVisible()
    }
  })

  test('the owner edits a passport value inline: Save under the field, Cancel restores it', async ({ page }) => {
    const plant = {
      id: 'e2e-inline-plant',
      code: 'POT-GOLD-M-EST',
      ownerId: ADMIN,
      speciesId: 'sp-pothos',
      title: 'E2E inline pothos',
      titleHe: 'E2E inline pothos',
      description: '',
      descriptionHe: '',
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
        return route.fulfill({ json: { plant: { ...plant, ...patched }, changed: Object.keys(patched) } })
      }
      return route.fulfill({ json: { plant } })
    })

    await expectPage(page, `/plants/${plant.id}`)
    const dialog = page.getByRole('dialog').first()
    await expect(dialog.getByText(plant.title).first()).toBeVisible()

    // Cancel restores the value and saves nothing.
    await dialog.getByRole('button', { name: 'Edit Name' }).click()
    const editor = dialog.locator('[data-inline-editor="Name"]')
    await editor.getByRole('textbox', { name: 'Name' }).fill('Renamed and cancelled')
    await expect(editor.getByRole('button', { name: 'Save' })).toBeVisible()
    await editor.getByRole('button', { name: 'Cancel' }).click()
    await expect(dialog.getByText(plant.title).first()).toBeVisible()
    expect(patched).toBeNull()

    // Save sends only that field and shows the new value in place.
    await dialog.getByRole('button', { name: 'Edit Name' }).click()
    await dialog.locator('[data-inline-editor="Name"]').getByRole('textbox', { name: 'Name' }).fill('E2E renamed pothos')
    await dialog.locator('[data-inline-editor="Name"]').getByRole('button', { name: 'Save' }).click()
    await expect(dialog.getByText('E2E renamed pothos').first()).toBeVisible()
    expect(patched).toMatchObject({ title: 'E2E renamed pothos' })
  })
})
