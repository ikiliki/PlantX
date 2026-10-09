import { LEGAL_VERSION } from '../src/features/legal/legalVersion'
import { MEMBER, ON_PP, expect, ppLogin, test } from './support'

/**
 * PP signs in with email + password (Supabase Auth), the way a person or a bot does. Nothing here creates an
 * account: sign-up is only checked for what the server refuses before it reaches Supabase.
 */
test.describe('PP email + password', () => {
  test.skip(!ON_PP, 'PP only: set PLANTX_PP_PASSWORD')

  test('a tester logs in through the login form and the PP badge names them', async ({ page }) => {
    const { email, password } = ppLogin(MEMBER)
    await page.context().clearCookies()
    await page.goto('/login')
    const form = page.locator('[data-password-form="login"]')
    await expect(form).toBeVisible()
    await page.locator('[data-terms-agree]').check()
    await form.getByLabel('Email').fill(email)
    await form.getByLabel('Password').fill(password)
    await form.getByRole('button', { name: 'Log in' }).click()
    await expect(page).toHaveURL(/\/greenhouse/)
    await expect(page.locator('[data-preprod-badge]')).toContainText(/Tester 1/)
  })

  test('a wrong password is refused with a clear message', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'phone', 'API check; once is enough')
    const { email } = ppLogin(MEMBER)
    const res = await page.request.post('/api/session/password', {
      data: { email, password: 'definitely-wrong-password', termsVersion: LEGAL_VERSION },
    })
    expect(res.status()).toBe(401)
  })

  test('sign-up refuses a known email, a short password and no Terms', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'phone', 'API check; once is enough')
    const signUp = (data: Record<string, unknown>) => page.request.post('/api/session/signup', { data })
    const fresh = `bot-${Date.now()}@preprod.invalid`
    expect((await signUp({ email: ppLogin(MEMBER).email, password: 'long-enough-1', termsVersion: LEGAL_VERSION })).status()).toBe(409)
    expect((await signUp({ email: fresh, password: 'short', termsVersion: LEGAL_VERSION })).status()).toBe(400)
    expect((await signUp({ email: fresh, password: 'long-enough-1' })).status()).toBe(400)
  })
})
