import { emptyClassDraft, sizeChoices, stageChoices } from '../src/features/greenhouse/plantClass'
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

  test('AI needs a photo; filling in by hand does not, but Save does', async ({ page }) => {
    const dialog = await openAddPlant(page)
    await expect(dialog.getByRole('button', { name: 'Continue with AI' })).toBeDisabled()
    await expect(dialog.getByRole('button', { name: 'Fill in manually' })).toBeEnabled()

    // The manual path walks the steps with no photo; Review offers a compact drop and Save waits for it.
    await dialog.getByRole('navigation').getByRole('button', { name: /Review/ }).click()
    await expect(dialog.getByRole('button', { name: 'Save to the greenhouse' })).toBeDisabled()
    await expect(dialog.locator('input[type=file]')).toHaveCount(2)
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

  test('size and stage the AI did not answer stay empty for the owner', async ({ page, identify }) => {
    const pick = await catalogPick(page)
    identify.answer(diagnosisFor(pick, { withTrait: true, withSizeStage: false }))
    const dialog = await openAddPlant(page)
    await dialog.locator('input[type=file]').setInputFiles(plantPhoto())
    await dialog.getByRole('button', { name: 'Continue with AI' }).click()

    await expect(dialog.getByRole('navigation').getByRole('button', { name: /Specs, needs input/ })).toBeVisible({
      timeout: 20_000,
    })
    await expect(dialog.getByRole('button', { name: 'Save to the greenhouse' })).toBeDisabled()
    await dialog.getByRole('navigation').getByRole('button', { name: /Specs/ }).click()
    for (const label of [/^size/i, /^stage/i]) {
      const group = dialog.getByRole('group', { name: label })
      await expect(group.getByRole('radio', { checked: true })).toHaveCount(0)
      await group.getByRole('radio').first().click({ force: true })
    }
    await dialog.getByRole('navigation').getByRole('button', { name: /Review/ }).click()
    await expect(dialog.getByRole('button', { name: 'Save to the greenhouse' })).toBeEnabled()
  })

  test('a size keeps only its stages; an AI stage it lacks is explained', async ({ page, identify }) => {
    const pick = await catalogPick(page)
    const base = { ...emptyClassDraft, categoryId: pick.category.id, subcategoryId: pick.sub.id }
    const all = stageChoices(pick.catalog, base)
    const size = sizeChoices(pick.catalog, base).find(
      (band) => stageChoices(pick.catalog, { ...base, size: band }).length < all.length,
    )
    test.skip(!size, 'Every size of this variety offers every stage')
    const narrowed = stageChoices(pick.catalog, { ...base, size })
    const lost = all.find((stage) => !narrowed.includes(stage))
    const answer = diagnosisFor(pick, { withTrait: true, withSizeStage: false })
    ;(answer.body as { diagnosis: { draft: { stage?: string } } }).diagnosis.draft.stage = lost
    identify.answer(answer)

    const dialog = await openAddPlant(page)
    await dialog.locator('input[type=file]').setInputFiles(plantPhoto())
    await dialog.getByRole('button', { name: 'Continue with AI' }).click()
    await expect(dialog.getByRole('navigation').getByRole('button', { name: /Specs, needs input/ })).toBeVisible({
      timeout: 20_000,
    })
    await dialog.getByRole('navigation').getByRole('button', { name: /Specs/ }).click()
    const stages = dialog.getByRole('group', { name: /^stage/i })
    await expect(stages.getByRole('radio')).toHaveCount(all.length)
    await expect(stages.getByRole('radio', { checked: true })).toHaveCount(1)

    await dialog.getByRole('group', { name: /^size/i }).getByRole('radio', { name: size, exact: true }).click()
    await expect(stages.getByRole('radio')).toHaveCount(narrowed.length)
    await expect(stages.getByText(new RegExp(`isn't offered in ${size}`))).toBeVisible()
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
