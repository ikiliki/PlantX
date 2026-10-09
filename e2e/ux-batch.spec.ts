import { ADMIN, MEMBER, expect, expectPage, signIn, test } from './support'

/** UX batch: Global loading (#77), scan allowance (#72), admin actions in one place (#71), inline edit (#70). */

const resetsAt = () => new Date(Date.now() + 3_600_000).toISOString()

test.describe('member', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, MEMBER)
  })

  test('/settings opens the account popup with the place and the AI scan allowance', async ({ page }) => {
    await page.route('**/api/identify/quota', (route) =>
      route.fulfill({ json: { quota: { used: 1, limit: 3, extra: 0, remaining: 2, resetsAt: resetsAt() } } }),
    )
    await expectPage(page, '/settings')
    await expect(page).toHaveURL(/\/greenhouse$/)
    const account = page.getByRole('dialog', { name: 'Account' })
    await expect(account.getByRole('combobox', { name: 'Greenhouse place' })).toBeVisible()
    // AI scans left sit on the Account tab.
    await account.getByRole('tab', { name: 'Account' }).click()
    const meter = account.locator('[data-scan-quota]')
    await expect(meter).toContainText('2 of 3 left')
    // Tapping the tile says when the scans reset.
    await meter.click()
    await expect(meter).toContainText('Resets at midnight')
  })

  test('the greenhouse header has no AI scan tile; the allowance lives in the account popup', async ({ page }, testInfo) => {
    await page.route('**/api/identify/quota', (route) =>
      route.fulfill({ json: { quota: { used: 1, limit: 3, extra: 0, remaining: 2, resetsAt: resetsAt() } } }),
    )
    await expectPage(page, '/greenhouse')
    const header = page.getByRole('complementary', { name: /Greenhouse level/ })
    if (testInfo.project.name === 'phone') {
      // The top-row "?" holds only the level rules now.
      await header.getByRole('button', { name: 'How levels work' }).click()
      await expect(header.getByText('How to level up')).toBeVisible()
    }
    await expect(header.locator('[data-scan-quota]')).toHaveCount(0)
  })

  test('on a phone, an unknown place is an orange pin that opens Set your place', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'phone layout only')
    await expectPage(page, '/greenhouse')
    const header = page.getByRole('complementary', { name: /Greenhouse level/ })
    const pin = header.locator('[data-place-button]')
    test.skip((await pin.count()) === 0, 'this member already has a greenhouse place')
    await expect(header.getByRole('link', { name: /Set your place/ })).toBeHidden()
    await pin.click()
    await expect(header.getByRole('link', { name: /Set your place/ })).toBeVisible()
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

test.describe('member Global list', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, MEMBER)
  })

  test('Global leaves out my own greenhouse and sorts the rest by level, highest first', async ({ page }) => {
    await page.goto('/greenhouse?scope=global')
    await expect(page.locator('[data-greenhouse-skeleton]')).toHaveCount(0, { timeout: 20_000 })
    await expect(page.locator(`[data-greenhouse="${MEMBER}"]`)).toHaveCount(0)
    const cards = page.locator('[data-greenhouse]:not([data-verified])')
    test.skip((await cards.count()) < 2, 'fewer than two other greenhouses to compare')
    const levels = (await cards.allInnerTexts()).map((text) => Number(/Level (\d+)/.exec(text)?.[1] ?? 0))
    expect(levels, 'levels never rise down the list').toEqual([...levels].sort((a, b) => b - a))
  })
})

test.describe('admin', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, ADMIN)
  })

  test('greenhouse filters stay one sideways row on a phone', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'phone layout only')
    await expectPage(page, '/greenhouse')
    const row = page.getByRole('tablist', { name: 'Greenhouse', exact: true })
    test.skip((await row.count()) === 0, 'no plants, so no filters')
    const tops = await row.getByRole('tab').evaluateAll((tabs) => tabs.map((tab) => Math.round(tab.getBoundingClientRect().top)))
    expect(new Set(tops).size, 'every filter chip on one row').toBe(1)
    expect(await row.evaluate((el) => getComputedStyle(el).overflowX)).toBe('auto')
  })

  test('the admin sees unlimited AI scans', async ({ page }) => {
    await expectPage(page, '/settings')
    const account = page.getByRole('dialog', { name: 'Account' })
    // Scans and sign out live on the dialog's Account tab.
    await account.getByRole('tab', { name: 'Account', exact: true }).click()
    await expect(account.locator('[data-scan-quota="unlimited"]')).toBeVisible()
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

  test('the owner edits a passport value in a popup: Cancel keeps it, Save updates it', async ({ page }) => {
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

    // Edit opens a popup; the passport keeps showing the value behind it. Cancel saves nothing.
    await dialog.getByRole('button', { name: 'Edit Name' }).click()
    const popup = page.getByRole('dialog', { name: 'Edit Name' })
    await expect(popup).toBeVisible()
    await expect(dialog.getByText(plant.title).first()).toBeVisible()
    await popup.getByRole('textbox', { name: 'Name' }).fill('Renamed and cancelled')
    await expect(popup.getByRole('button', { name: 'Save' })).toBeEnabled()
    await popup.getByRole('button', { name: 'Cancel' }).click()
    await expect(popup).toHaveCount(0)
    await expect(dialog.getByText(plant.title).first()).toBeVisible()
    expect(patched).toBeNull()

    // Save sends only that field, closes the popup, and shows the new value.
    await dialog.getByRole('button', { name: 'Edit Name' }).click()
    await popup.getByRole('textbox', { name: 'Name' }).fill('E2E renamed pothos')
    await popup.getByRole('button', { name: 'Save' }).click()
    await expect(popup).toHaveCount(0)
    await expect(dialog.getByText('E2E renamed pothos').first()).toBeVisible()
    expect(patched).toMatchObject({ title: 'E2E renamed pothos' })
  })
})
