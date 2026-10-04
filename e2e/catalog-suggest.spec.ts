import type { Catalog, CatalogSuggestion, CatalogSuggestionInput } from '../src/mock/types'
import { expect, expectPage, signIn, test } from './support'

/**
 * Catalog suggestions. The member flow answers the suggestion routes in the test, so a run files no rows;
 * the API checks only send requests the server refuses, or reads.
 */

async function liveCatalog(page: import('@playwright/test').Page) {
  return ((await (await page.request.get('/api/catalog')).json()) as { catalog: Catalog }).catalog
}

test.describe('catalog suggestions', () => {
  test('the suggestions API needs a member and refuses a bad or existing plant', async ({ page }) => {
    expect((await page.request.get('/api/catalog/suggestions/mine')).status()).toBe(401)
    expect((await page.request.post('/api/catalog/suggestions', { data: { name: 'Nope' } })).status()).toBe(401)

    await signIn(page)
    const mine = await page.request.get('/api/catalog/suggestions/mine')
    expect(mine.ok(), `mine: HTTP ${mine.status()}`).toBeTruthy()
    expect(Array.isArray(((await mine.json()) as { suggestions: unknown }).suggestions)).toBe(true)

    expect((await page.request.post('/api/catalog/suggestions', { data: { name: ' ' } })).status()).toBe(400)
    const catalog = await liveCatalog(page)
    const taken = catalog.categories[0]
    test.skip(!taken, 'The catalog is empty')
    expect((await page.request.post('/api/catalog/suggestions', { data: { name: taken.name } })).status()).toBe(409)
    expect(
      (await page.request.post('/api/catalog/suggestions', { data: { name: 'Variety X', categoryId: 'no-such-category' } })).status(),
    ).toBe(400)
  })

  test('a member suggests a variety and sees it pending in the catalog', async ({ page }) => {
    await signIn(page)
    const filed: CatalogSuggestion[] = []
    let sent: CatalogSuggestionInput | undefined
    await page.route('**/api/catalog/suggestions/mine', (route) => route.fulfill({ json: { suggestions: filed } }))
    await page.route('**/api/catalog/suggestions', async (route) => {
      if (route.request().method() !== 'POST') return route.fallback()
      sent = route.request().postDataJSON() as CatalogSuggestionInput
      const suggestion: CatalogSuggestion = {
        id: 'sug-e2e',
        createdAt: new Date().toISOString(),
        name: sent.name,
        scientificName: sent.scientificName,
        genus: '',
        commonNames: [sent.name],
        provider: '',
        hits: 1,
        status: 'open',
        origin: 'member',
        suggestedBy: ['u-admin'],
        note: sent.note,
        draft: {
          categoryId: sent.categoryId,
          category: { name: 'Parent', nameHe: '', ticker: 'PRNT', photo: '' },
          subcategory: { name: sent.name, nameHe: '', code: 'E2E', photo: '' },
          properties: [],
        },
      }
      filed.push(suggestion)
      await route.fulfill({ json: { suggestion } })
    })

    await expectPage(page, '/wiki')
    await expect(page.getByTestId('pending-suggestion')).toHaveCount(0)
    await page.getByRole('button', { name: /suggest a plant/i }).click()
    const dialog = page.getByRole('dialog', { name: 'Suggest a plant' })
    await expect(dialog).toBeVisible()

    await dialog.getByRole('radio', { name: 'A new variety' }).click()
    await dialog.getByLabel('Variety name').fill('E2E Marble Star')
    await dialog.getByRole('button', { name: 'Send suggestion' }).click()
    await expect(dialog.getByText('Pick the plant this variety belongs to.').first()).toBeVisible()
    expect(sent).toBeUndefined()

    const parents = dialog.getByRole('radiogroup', { name: 'Variety of' })
    await parents.getByRole('radio').first().click()
    await dialog.getByPlaceholder(/where you found it/i).fill('Seen at a nursery.')
    await dialog.getByRole('button', { name: 'Send suggestion' }).click()

    // The dialog is named by its heading, which becomes the thank-you once sent.
    const thanks = page.getByRole('dialog', { name: "Thanks! It's waiting for review" })
    await expect(thanks).toBeVisible()
    expect(sent?.name).toBe('E2E Marble Star')
    expect(sent?.categoryId).toBeTruthy()
    await thanks.getByRole('button', { name: 'Done' }).click()
    await expect(thanks).toHaveCount(0)

    const card = page.getByTestId('pending-suggestion').filter({ hasText: 'E2E Marble Star' })
    await expect(card).toBeVisible()
    await expect(card).toContainText('Pending review')
    await expect(card).toContainText('Suggested by you')
  })

  test('the form says when the plant is already in the catalog', async ({ page }) => {
    await signIn(page)
    const catalog = await liveCatalog(page)
    const taken = catalog.categories[0]
    test.skip(!taken, 'The catalog is empty')
    await expectPage(page, '/wiki')
    await page.getByRole('button', { name: /suggest a plant/i }).click()
    const dialog = page.getByRole('dialog', { name: 'Suggest a plant' })
    await dialog.getByLabel('Plant name').fill(taken.name)
    await expect(dialog.getByRole('alert')).toContainText('already in the catalog')
    await expect(dialog.getByRole('button', { name: 'Send suggestion' })).toBeDisabled()
  })

  test('admin Requests can start a new catalog entry', async ({ page }) => {
    await signIn(page)
    await expectPage(page, '/admin/requests')
    await page.getByRole('button', { name: /new catalog entry/i }).click()
    const editor = page.getByRole('dialog', { name: 'New catalog entry' })
    await expect(editor).toBeVisible()
    await editor.getByRole('button', { name: 'Cancel' }).last().click()
    await expect(editor).toHaveCount(0)
  })
})
