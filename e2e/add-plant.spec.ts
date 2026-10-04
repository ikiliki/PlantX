import {
  catalogPick,
  diagnosisFor,
  expect,
  identifyFailed,
  openAddPlant,
  plantPhoto,
  signIn,
  test,
} from './support'

/** Identify is always answered by the test (see support.ts); no provider is called. */
test.describe('Add Plant', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('asks for a photo first', async ({ page }) => {
    const dialog = await openAddPlant(page)
    await expect(dialog.getByText('Add a photo to continue')).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Continue with AI' })).toBeDisabled()
    await expect(dialog.getByRole('button', { name: 'Fill in manually' })).toBeDisabled()
    await expect(dialog.getByRole('navigation').getByRole('button', { name: /Review/ })).toBeDisabled()
  })

  test('a full AI answer is ready to save', async ({ page, identify }) => {
    const pick = await catalogPick(page)
    identify.answer(diagnosisFor(pick, { withTrait: true }))
    const dialog = await openAddPlant(page)
    await dialog.locator('input[type=file]').setInputFiles(plantPhoto())
    await dialog.getByRole('button', { name: 'Continue with AI' }).click()
    // Step headings hide under 420px of the dialog, so check what shows at every width.
    await expect(dialog.getByRole('button', { name: 'Save to the greenhouse' })).toBeEnabled({ timeout: 20_000 })
    await expect(dialog.getByText("AI couldn't fill these")).toHaveCount(0)
  })

  test('a field AI missed is flagged and can be filled from Review', async ({ page, identify }) => {
    const pick = await catalogPick(page)
    const trait = pick.trait.name
    identify.answer(diagnosisFor(pick, { withTrait: false }))
    const dialog = await openAddPlant(page)
    await dialog.locator('input[type=file]').setInputFiles(plantPhoto())
    await dialog.getByRole('button', { name: 'Continue with AI' }).click()

    await expect(dialog.getByText("AI couldn't fill these")).toBeVisible({ timeout: 20_000 })
    await expect(dialog.getByRole('button', { name: 'Save to the greenhouse' })).toBeDisabled()
    await expect(dialog.getByRole('navigation').getByRole('button', { name: /Specs, needs input/ })).toBeVisible()

    await dialog.getByRole('button', { name: trait, exact: true }).click()
    const group = dialog.getByRole('group', { name: new RegExp(trait, 'i') })
    await expect(group.getByText("AI couldn't fill this")).toBeVisible()
    await group.getByRole('radio').first().click()

    await dialog.getByRole('navigation').getByRole('button', { name: /Review/ }).click()
    await expect(dialog.getByRole('button', { name: 'Save to the greenhouse' })).toBeEnabled()
    await expect(dialog.getByText("AI couldn't fill these")).toHaveCount(0)
  })

  test('a failed scan locks AI until the photo changes', async ({ page, identify }) => {
    identify.answer(identifyFailed)
    const dialog = await openAddPlant(page)
    await dialog.locator('input[type=file]').setInputFiles(plantPhoto())
    await dialog.getByRole('button', { name: 'Continue with AI' }).click()

    await expect(dialog.getByText("AI couldn't finish reading this photo", { exact: false })).toBeVisible({ timeout: 20_000 })
    await expect(dialog.getByRole('button', { name: 'Continue with AI' })).toBeDisabled()
    await expect(dialog.getByRole('navigation').getByRole('button', { name: /Identity/ })).toBeEnabled()

    await dialog.getByRole('button', { name: 'Remove photo 1' }).click()
    await dialog.locator('input[type=file]').setInputFiles(plantPhoto())
    await expect(dialog.getByRole('button', { name: 'Continue with AI' })).toBeEnabled()
  })
})
