import { readFileSync } from 'node:fs'
import { expect, test as base, type Page } from '@playwright/test'
import { emptyClassDraft, sizeChoices, stageChoices } from '../src/features/greenhouse/plantClass'
import type { Catalog, Diagnosis } from '../src/mock/types'

/** Admin exists on QA and PP. */
export const ADMIN = 'u-admin'

/** A plain member: PP's first tester, or the one scripts/e2e-seed.mjs adds to the CI QA stack. */
export const MEMBER = process.env.PLANTX_TEST_TOKEN?.trim() ? 'test-user-001' : 'e2e-member'

const CORE = ['health', 'size', 'stage', 'area']

export type IdentifyAnswer = { status: number; body: unknown }

/**
 * Every test gets these guards:
 * - Identify never reaches the server, so no live provider can run. Tests answer it with `answerIdentify`.
 * - Creating a plant is blocked, so a run leaves no rows behind.
 * - An uncaught page error fails the test.
 */
export const test = base.extend<{ identify: { answer: (next: IdentifyAnswer) => void } }>({
  identify: [
    async ({ page }, use) => {
      let answer: IdentifyAnswer = { status: 503, body: { error: 'unavailable', tried: [] } }
      await page.route('**/api/identify', (route) =>
        route.request().method() === 'POST'
          ? route.fulfill({ status: answer.status, contentType: 'application/json', body: JSON.stringify(answer.body) })
          : route.fallback(),
      )
      await page.route('**/api/identify/test', (route) => route.abort())
      await page.route('**/api/plants', (route) =>
        route.request().method() === 'POST' ? route.abort() : route.fallback(),
      )
      await use({ answer: (next) => (answer = next) })
    },
    { auto: true },
  ],
  page: async ({ page }, use) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await use(page)
    expect(errors, 'uncaught page errors').toEqual([])
  },
})

export { expect }

/** Session cookies per user, kept for the worker: PP's firewall answers 403 after ~45 logins in a run. */
const sessions = new Map<string, Awaited<ReturnType<ReturnType<Page['context']>['cookies']>>>()

/** QA: the session route. PP: the test-login route with the token. Signs in once per user, then reuses the cookie. */
export async function signIn(page: Page, userId = ADMIN) {
  const cached = sessions.get(userId)
  if (cached) {
    await page.context().addCookies(cached)
    return
  }
  const token = process.env.PLANTX_TEST_TOKEN?.trim()
  const res = token
    ? await page.request.post('/api/session/test-login', { headers: { 'X-Test-Token': token }, data: { userId } })
    : await page.request.post('/api/session', { data: { userId } })
  const detail = res.ok() ? '' : ` ${(await res.text().catch(() => '')).slice(0, 200)}`
  expect(res.ok(), `sign in as ${userId}: HTTP ${res.status()}${detail}`).toBeTruthy()
  sessions.set(userId, await page.context().cookies())
}

/** A route shows real content, not a blank page or the error boundary. */
export async function expectPage(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  const main = page.locator('main')
  await expect(main).toBeVisible()
  await expect(main).not.toHaveText(/^\s*$/)
  await expect(page.getByText(/Something went wrong/i)).toHaveCount(0)
}

export const plantPhoto = () => ({
  name: 'plant.jpg',
  mimeType: 'image/jpeg',
  buffer: readFileSync('public/class-photos/begonia-std.jpg'),
})

/** A category with a required trait, so a test can leave it out of the AI answer. */
export async function catalogPick(page: Page) {
  const { catalog } = (await (await page.request.get('/api/catalog')).json()) as { catalog: Catalog }
  for (const category of catalog.categories) {
    const trait = catalog.properties.find(
      (item) =>
        item.required &&
        !CORE.includes(item.id) &&
        item.subcategoryIds.length === 0 &&
        item.categoryIds.includes(category.id) &&
        item.options.length > 0,
    )
    const sub = catalog.subcategories.find((item) => item.categoryId === category.id)
    if (trait && sub) return { catalog, category, sub, trait }
  }
  throw new Error('No catalog category with a required trait')
}

/** `withSizeStage` (default on): the answer also names a size and stage valid for the pick. */
export function diagnosisFor(
  pick: Awaited<ReturnType<typeof catalogPick>>,
  { withTrait, withSizeStage = true }: { withTrait: boolean; withSizeStage?: boolean },
): IdentifyAnswer {
  const name = pick.category.name
  const base = { ...emptyClassDraft, categoryId: pick.category.id, subcategoryId: pick.sub.id }
  const sizeStage = withSizeStage
    ? { size: sizeChoices(pick.catalog, base)[0], stage: stageChoices(pick.catalog, base)[0] }
    : {}
  const diagnosis: Diagnosis = {
    provider: 'gemini',
    mode: 'mock',
    label: name,
    scientificName: name,
    commonNames: [name],
    probability: 0.88,
    isPlant: true,
    draft: {
      categoryId: pick.category.id,
      subcategoryId: pick.sub.id,
      ...sizeStage,
      traits: withTrait ? { [pick.trait.id]: pick.trait.options[0].id } : {},
    },
    tried: [],
    steps: [
      { id: 'gate', provider: 'gemini', ok: true, isPlant: true },
      { id: 'species', provider: 'plantnet', ok: true, isPlant: true, label: name, scientificName: name, probability: 0.88 },
      { id: 'draft', provider: 'gemini', ok: true, isPlant: true, label: name, scientificName: name, probability: 0.88 },
    ],
  }
  return { status: 200, body: { diagnosis, record: { id: `e2e-${Date.now()}` } } }
}

export const identifyFailed: IdentifyAnswer = {
  status: 503,
  body: { error: 'unavailable', tried: [{ provider: 'gemini', reason: 'error', detail: 'e2e' }] },
}

/** Opens Add Plant from the greenhouse and returns the dialog. */
export async function openAddPlant(page: Page) {
  await page.goto('/greenhouse')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: /add (your first|another) plant|add a plant/i }).first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  return dialog
}
