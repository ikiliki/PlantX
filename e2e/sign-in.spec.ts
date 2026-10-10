import type { Page } from '@playwright/test'
import { expect, test } from './support'

/**
 * Google sign-in without Google: the test turns Google on for the page and swaps Google's script for a fake button
 * that hands back a made-up credential, and answers POST /api/session/google itself. Nothing signs in or writes,
 * so this also runs against production.
 */
async function fakeGoogle(page: Page) {
  await page.route('**/api/session/google', async (route) => {
    if (route.request().method() === 'GET') await route.fulfill({ json: { enabled: true, clientId: 'e2e-client' } })
    else await route.fallback()
  })
  await page.route('https://accounts.google.com/gsi/client**', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: `window.google = { accounts: { id: {
        initialize(config) { window.__gsi = config },
        renderButton(el, options) {
          const button = document.createElement('button')
          button.type = 'button'
          button.dataset.fakeGoogle = options.text
          button.textContent = 'Google ' + options.text
          button.onclick = () => window.__gsi.callback({ credential: 'e2e-credential' })
          el.appendChild(button)
        },
      } } }`,
    }),
  )
}

test.describe('sign in @prod', () => {
  test('Log in with a Google account PlantX does not know switches to Sign up instead of creating it', async ({ page }) => {
    await fakeGoogle(page)
    const intents: unknown[] = []
    await page.route('**/api/session/google', async (route) => {
      if (route.request().method() !== 'POST') return route.fallback()
      intents.push((route.request().postDataJSON() as { intent?: unknown }).intent)
      await route.fulfill({ status: 404, json: { error: 'no_account', message: 'No PlantX account yet.' } })
    })

    await page.goto('/login')
    await page.locator('[data-terms-agree]').check()
    await page.locator('[data-fake-google="continue_with"]').click()

    await expect(page.locator('[data-no-account]')).toContainText('no PlantX account for that Google account yet')
    await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible()
    expect(intents).toEqual(['login'])

    // Sign up asks again, now to create the account.
    await page.locator('[data-fake-google="signup_with"]').click()
    await expect.poll(() => intents).toEqual(['login', 'register'])
  })

  test.describe('inside the Google app on an iPhone', () => {
    test.use({
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/380.0.778463337 Mobile/15E148 Safari/604.1',
    })

    test('sends the visitor to Safari or Chrome instead of a Google button that hangs', async ({ page }) => {
      await fakeGoogle(page)
      await page.goto('/login')
      const notice = page.locator('[data-in-app-browser]')
      await expect(notice).toContainText('Open PlantX in Safari or Chrome')
      await expect(notice).toContainText('inside the Google app')
      await expect(notice.getByRole('link', { name: 'Open in Safari' })).toHaveAttribute('href', /^x-safari-https?:\/\/.+\/login$/)
      await expect(notice.getByRole('link', { name: 'Open in Chrome' })).toHaveAttribute('href', /^googlechromes?:\/\/.+\/login$/)
      await expect(notice.getByRole('button', { name: 'Copy link' })).toBeVisible()
      await expect(page.locator('[data-fake-google]')).toHaveCount(0)
    })
  })
})
