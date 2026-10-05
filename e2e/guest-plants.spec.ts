import { expect, expectPage, signIn, test } from './support'

/** A plant a guest saved on this device: what they filled in, no place, no AI result. */
const guestPlant = {
  id: 'guest-e2e-1',
  createdAt: '2026-10-05',
  title: 'E2E guest pothos',
  titleHe: 'פוטוס אורח',
  description: '',
  descriptionHe: '',
  photos: ['/class-photos/pot-gold-a-l-mat.jpg'],
  speciesId: 'sp-pothos',
  variety: 'Golden',
  varietyHe: 'זהוב',
  quality: '',
  sizeBand: 'M',
  stage: 'EST',
  code: 'POT-GOLD-M-EST',
}

test.describe('guest plants on this device', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((plant) => {
      localStorage.setItem('plantx.guestPlants.v1', JSON.stringify([plant]))
    }, guestPlant)
  })

  test('the greenhouse shows a guest plant saved on this device', { tag: '@prod' }, async ({ page }) => {
    await expectPage(page, '/greenhouse')
    await expect(page.getByText(guestPlant.title).first()).toBeVisible()
    await expect(page.getByRole('note').filter({ hasText: 'Saved on this device only' })).toBeVisible()
    // The guest card does not open a passport.
    await expect(page.locator(`a[href="/plants/${guestPlant.id}"]`)).toHaveCount(0)
  })

  test('signing in sends the guest plant to the account', async ({ page }) => {
    // support.ts aborts POST /api/plants, so the plant is not created and stays in the browser.
    const posted = page.waitForRequest(
      (request) => request.method() === 'POST' && /\/api\/plants$/.test(new URL(request.url()).pathname),
    )
    await signIn(page)
    await page.goto('/greenhouse')
    const body = (await posted).postDataJSON() as { title: string; photos: string[] }
    expect(body.title).toBe(guestPlant.title)
    expect(body.photos).toEqual(guestPlant.photos)
    const kept = await page.evaluate(() => localStorage.getItem('plantx.guestPlants.v1'))
    expect(kept, 'a failed save keeps the plant on the device').toContain(guestPlant.id)
  })
})
