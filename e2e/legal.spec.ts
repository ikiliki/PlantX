import { LEGAL_VERSION } from '../src/features/legal/legalVersion'
import { ADMIN, MEMBER, expect, expectPage, signIn, test } from './support'

/**
 * Legal & consent (MVP), the anonymous public name (#95) and the funnel API (#59).
 * Nothing here deletes an account or changes consent for real: the delete and consent calls are answered
 * by the test, and analytics rows are written only on QA / PP (no @prod test sends events).
 */

test.describe('legal pages @prod', () => {
  test('privacy policy and terms open for a guest, with links between them', async ({ page }) => {
    await expectPage(page, '/privacy')
    await expect(page.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeVisible()
    await expect(page.getByText(`Effective ${LEGAL_VERSION}`)).toBeVisible()
    await page.getByRole('navigation').getByRole('link', { name: 'Terms of Use' }).click()
    await expect(page).toHaveURL(/\/terms$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Terms of Use' })).toBeVisible()
  })

  test('the login page asks to agree before Google can be used', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    const agree = page.locator('[data-terms-agree]')
    // With Google sign-in off the panel says sign-ups are paused, and there is nothing to agree to.
    test.skip(!(await agree.isVisible()), 'Google sign-in is off here')
    await expect(page.locator('[aria-disabled="true"]').filter({ has: page.locator('[aria-busy]') })).toHaveCount(1)
    await agree.check()
    await expect(page.locator('[aria-disabled="true"]').filter({ has: page.locator('[aria-busy]') })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy')
  })
})

test.describe('member', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, MEMBER)
  })

  test('a member who has not agreed to the current terms is asked once', async ({ page }) => {
    // Pretend the member agreed to an older version; the agree call is answered here.
    await page.route('**/api/live', async (route) => {
      const response = await route.fetch()
      const json = await response.json()
      if (json.currentUser) json.currentUser.termsVersion = '2000-01-01'
      await route.fulfill({ response, json })
    })
    let agreed: unknown = null
    await page.route('**/api/session/consent', async (route) => {
      agreed = route.request().postDataJSON()
      const live = await (await page.request.get('/api/live')).json()
      await route.fulfill({ json: { user: { ...live.currentUser, termsVersion: LEGAL_VERSION } } })
    })
    await page.goto('/greenhouse')
    const dialog = page.getByRole('dialog', { name: /Updated Terms/ })
    await expect(dialog).toBeVisible()
    // Not dismissible: Escape leaves it open.
    await page.keyboard.press('Escape')
    await expect(dialog).toBeVisible()
    await dialog.locator('[data-consent-agree]').click()
    await expect(dialog).toBeHidden()
    expect(agreed).toEqual({ version: LEGAL_VERSION })
  })

  test('Delete my account confirms, then signs out', async ({ page }) => {
    let deleted = false
    await page.route('**/api/session/account', async (route) => {
      if (route.request().method() !== 'DELETE') return route.fallback()
      deleted = true
      const live = await (await page.request.get('/api/live')).json()
      await route.fulfill({ json: { ...live, currentUser: null, currentUserId: null } })
    })
    await page.goto('/greenhouse?account=1')
    await page.locator('[data-delete-account]').click()
    const confirm = page.getByRole('dialog', { name: 'Delete your account?' })
    await expect(confirm).toBeVisible()
    await confirm.locator('[data-delete-account-confirm]').click()
    await expect(page).toHaveURL(/\/login/)
    expect(deleted).toBe(true)
  })

  test('other growers come with their public name only (#95)', async ({ page }) => {
    const res = await page.request.get('/api/users/directory')
    expect(res.ok()).toBeTruthy()
    const { users } = (await res.json()) as { users: Record<string, unknown>[] }
    for (const user of users) {
      expect(user.email, 'no email').toBeUndefined()
      expect(user.termsVersion, 'no consent record').toBeUndefined()
      if (user.id === MEMBER) continue
      const nickname = typeof user.nickname === 'string' ? user.nickname.trim() : ''
      if (nickname) expect(user.name).toBe(nickname)
      else expect(user.name).toMatch(/^Grower [A-Z0-9]{1,4}$/)
      expect(user.nameHe).toBe(user.name)
    }
  })

  test('the browser may send only allow-listed funnel events', async ({ page }) => {
    expect((await page.request.post('/api/events', { data: { name: 'plant_add_start' } })).status()).toBe(204)
    expect((await page.request.post('/api/events', { data: { name: 'plant_saved' } })).status()).toBe(400)
    expect((await page.request.post('/api/events', { data: { name: 'drop table' } })).status()).toBe(400)
    expect((await page.request.get('/api/events/funnel')).status()).toBe(403)
  })
})

test.describe('admin', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, ADMIN)
  })

  test('Admin → System shows the funnel', async ({ page }) => {
    const res = await page.request.get('/api/events/funnel')
    expect(res.ok()).toBeTruthy()
    expect(Array.isArray(((await res.json()) as { days: unknown }).days)).toBe(true)
    await expectPage(page, '/admin/system')
    await expect(page.locator('[data-funnel]')).toBeVisible()
  })

  test('the admin account has no Delete my account', async ({ page }) => {
    await page.goto('/greenhouse?account=1')
    await expect(page.getByRole('dialog').first()).toBeVisible()
    await expect(page.locator('[data-delete-account]')).toHaveCount(0)
  })
})
