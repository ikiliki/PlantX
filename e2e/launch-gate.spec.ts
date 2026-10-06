import type { Page } from '@playwright/test'
import { ADMIN, MEMBER, expect, signIn, test } from './support'

type System = { launched: boolean } & Record<string, unknown>
type Member = { id: string; preapproved?: boolean }

async function as(page: Page, userId: string) {
  await page.context().clearCookies()
  await signIn(page, userId)
}

/**
 * App off (`launched: false`): only the operator and pre-approved members get in; everyone else sees the
 * not-launched hold. Sign-up itself (app on: the account opens at once; app off: a pre-approval request) needs a
 * real Google token, so it is not driven here. The test puts the switch and the member's mark back.
 */
test.describe('launch gate', () => {
  test('with the app off only pre-approved members enter', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'phone', 'Server state check; once is enough')

    await as(page, ADMIN)
    const { system } = (await (await page.request.get('/api/live')).json()) as { system: System }
    const members = (await (await page.request.get('/api/users')).json()) as { users?: Member[] }
    const wasPreapproved = Boolean(members.users?.find((user) => user.id === MEMBER)?.preapproved)
    const setMark = async (preapproved: boolean) => {
      const res = await page.request.post(`/api/users/${MEMBER}/preapproved`, { data: { preapproved } })
      expect(res.ok(), `preapproved=${preapproved}: HTTP ${res.status()}`).toBeTruthy()
    }

    try {
      expect((await page.request.put('/api/system', { data: { ...system, launched: false } })).ok()).toBeTruthy()
      await setMark(false)

      await as(page, MEMBER)
      await page.goto('/greenhouse')
      await expect(page.getByText(/open yet/i).first()).toBeVisible()

      await as(page, ADMIN)
      await setMark(true)

      await as(page, MEMBER)
      await page.goto('/greenhouse')
      await expect(page.locator('main')).toBeVisible()
      await expect(page.getByText(/open yet/i)).toHaveCount(0)
    } finally {
      await as(page, ADMIN)
      await page.request.put('/api/system', { data: system })
      await page.request.post(`/api/users/${MEMBER}/preapproved`, { data: { preapproved: wasPreapproved } })
    }
  })
})
