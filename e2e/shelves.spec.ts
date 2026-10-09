import { MEMBER, expect, expectPage, signIn, test } from './support'

/** Greenhouse shelves. The shelves API is answered here, so nothing is stored on the server. */
test.describe('greenhouse shelves', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, MEMBER)
  })

  test('add a shelf, delete it, and its plants go back to Not on a shelf; the view is remembered', async ({ page }) => {
    const shelves: { id: string; ownerId: string; name: string; position: number }[] = []
    await page.route('**/api/shelves', async (route) => {
      if (route.request().method() === 'POST') {
        const { name } = route.request().postDataJSON() as { name: string }
        const shelf = { id: `e2e-shelf-${shelves.length + 1}`, ownerId: MEMBER, name, position: shelves.length }
        shelves.push(shelf)
        return route.fulfill({ status: 201, json: { shelf } })
      }
      await route.fulfill({ json: { shelves, placements: [] } })
    })
    await page.route('**/api/shelves/*', async (route) => {
      const id = route.request().url().split('/').pop()
      const index = shelves.findIndex((shelf) => shelf.id === id)
      if (index >= 0) shelves.splice(index, 1)
      await route.fulfill({ json: { ok: true, shelves } })
    })
    await page.route('**/api/plants/*/shelf', (route) => route.fulfill({ json: { placement: null } }))

    await expectPage(page, '/greenhouse')
    const switcher = page.getByRole('radiogroup', { name: 'Show plants as' })
    test.skip((await switcher.count()) === 0, 'this member has no plants, so there is no toolbar')

    await switcher.getByRole('radio', { name: 'Shelves' }).click()
    const board = page.locator('[data-shelf-board]')
    await expect(board.locator('[data-shelf="none"]')).toBeVisible()
    const loose = await board.locator('[data-shelf="none"] [data-move-plant]').count()

    await board.getByRole('textbox', { name: 'Shelf name' }).fill('   ')
    await expect(board.getByRole('button', { name: 'Add shelf' })).toBeDisabled()
    await board.getByRole('textbox', { name: 'Shelf name' }).fill('Balcony')
    await board.getByRole('button', { name: 'Add shelf' }).click()
    const balcony = board.locator('[data-shelf="e2e-shelf-1"]')
    await expect(balcony.getByRole('heading', { name: /Balcony/ })).toBeVisible()

    // Move one plant onto it, then delete the shelf: the plant is back under Not on a shelf.
    if (loose > 0) {
      await board.locator('[data-shelf="none"] [data-move-plant]').first().selectOption({ label: 'Balcony' })
      await expect(balcony.locator('[data-move-plant]')).toHaveCount(1)
    }
    await balcony.locator('[data-shelf-delete]').click()
    await page.locator('[data-shelf-delete-confirm]').click()
    await expect(balcony).toHaveCount(0)
    await expect(board.locator('[data-shelf="none"] [data-move-plant]')).toHaveCount(loose)

    await page.reload()
    await expect(page.getByRole('radiogroup', { name: 'Show plants as' }).getByRole('radio', { name: 'Shelves' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  test('plant cards have one status line and nothing over the photo', async ({ page }) => {
    await expectPage(page, '/greenhouse')
    const cards = page.locator('[data-plant-card]')
    const count = await cards.count()
    test.skip(count === 0, 'this member has no plants')
    await expect(page.locator('[data-plant-card] [data-card-status]')).toHaveCount(count)
    await expect(page.locator('[data-plant-card] [data-identify-badge]')).toHaveCount(0)
  })

  test('a grower’s public greenhouse has no Grid / Shelves switch', async ({ page }) => {
    await expectPage(page, '/greenhouse/u-admin')
    await expect(page.getByRole('radiogroup', { name: 'Show plants as' })).toHaveCount(0)
  })
})
