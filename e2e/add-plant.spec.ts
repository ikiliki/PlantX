import { emptyClassDraft, sizeChoices, stageChoices } from '../src/features/greenhouse/plantClass'
import {
  catalogPick,
  diagnosisFor,
  expect,
  identifyFailed,
  openAddPlant,
  takePhoto,
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

    // The manual path walks the steps with no photo; Review offers the camera and Save waits for it.
    await dialog.getByRole('navigation').getByRole('button', { name: /Review/ }).click()
    await expect(dialog.getByRole('button', { name: 'Save to the greenhouse' })).toBeDisabled()
    await expect(dialog.locator('[data-camera-open]:visible')).toHaveCount(1)
  })

  test('photos come only from the camera: no file picker, and a taken photo is ready for AI', async ({ page }) => {
    const dialog = await openAddPlant(page)
    // No gallery, file picker or drop: the only way in is the camera.
    await expect(page.locator('input[type=file]')).toHaveCount(0)
    await expect(dialog.getByText('Taken live with your camera, not from the gallery.')).toBeVisible()
    await takePhoto(dialog)
    await expect(dialog.getByRole('button', { name: 'Continue with AI' })).toBeEnabled()
    await expect(dialog.locator('img[src^="data:image/jpeg"]').first()).toBeAttached()
  })

  test('the camera is asked for first, and a refusal says how to turn it on', async ({ page }) => {
    // The browser has not decided yet, and then refuses (as if the person tapped Block).
    await page.addInitScript(() => {
      const query = navigator.permissions.query.bind(navigator.permissions)
      navigator.permissions.query = (descriptor) =>
        descriptor.name === ('camera' as PermissionName)
          ? Promise.resolve({ state: 'prompt' } as PermissionStatus)
          : query(descriptor)
      navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('Blocked', 'NotAllowedError'))
    })
    const dialog = await openAddPlant(page)
    await dialog.locator('[data-camera-open]:visible').first().click()

    const ask = page.getByRole('dialog', { name: 'Allow the camera' })
    await expect(ask).toContainText('Gallery photos can’t be used')
    await expect(ask.getByRole('link', { name: 'How we use photos' })).toHaveAttribute('href', '/privacy')
    await ask.getByRole('button', { name: 'Allow camera' }).click()

    const denied = page.getByRole('dialog', { name: 'Camera access is off' })
    await expect(denied).toContainText('settings')
    await expect(denied.locator('[data-camera-use]')).toHaveCount(0)
    await denied.getByRole('button', { name: 'Cancel' }).click()
    await expect(denied).toHaveCount(0)
    // Add Plant stays open and still has no photo.
    await expect(dialog.getByRole('button', { name: 'Continue with AI' })).toBeDisabled()
  })

  test('a full AI answer is ready to save', async ({ page, identify }) => {
    const pick = await catalogPick(page)
    identify.answer(diagnosisFor(pick, { withTrait: true }))
    const dialog = await openAddPlant(page)
    await takePhoto(dialog)
    await dialog.getByRole('button', { name: 'Continue with AI' }).click()
    // Step headings hide under 420px of the dialog, so check what shows at every width.
    await expect(dialog.getByRole('button', { name: 'Save to the greenhouse' })).toBeEnabled({ timeout: 20_000 })
    await expect(dialog.getByText("AI couldn't fill these")).toHaveCount(0)
  })

  test('a save the server did not store says so and keeps the form, not a done screen', async ({ page, identify }) => {
    // support.ts aborts POST /api/plants, which is what a rejected or lost save looks like to the browser.
    const pick = await catalogPick(page)
    identify.answer(diagnosisFor(pick, { withTrait: true }))
    const dialog = await openAddPlant(page)
    await takePhoto(dialog)
    await dialog.getByRole('button', { name: 'Continue with AI' }).click()
    const save = dialog.getByRole('button', { name: 'Save to the greenhouse' })
    await expect(save).toBeEnabled({ timeout: 20_000 })
    await save.click()

    await expect(dialog.getByText("Couldn't save. Try again.")).toBeVisible()
    await expect(dialog.locator('[data-add-done]')).toHaveCount(0)
    await expect(save).toBeEnabled()
  })

  test('the description is optional', async ({ page, identify }) => {
    const pick = await catalogPick(page)
    identify.answer(diagnosisFor(pick, { withTrait: true }))
    const dialog = await openAddPlant(page)
    await takePhoto(dialog)
    await dialog.getByRole('button', { name: 'Continue with AI' }).click()
    await expect(dialog.getByRole('button', { name: 'Save to the greenhouse' })).toBeEnabled({ timeout: 20_000 })
    await dialog.getByRole('navigation').getByRole('button', { name: /Details/ }).click()
    await dialog.locator('textarea').fill('')
    await dialog.getByRole('navigation').getByRole('button', { name: /Review/ }).click()
    await expect(dialog.getByRole('button', { name: 'Save to the greenhouse' })).toBeEnabled()
  })

  test('size and stage the AI did not answer stay empty for the owner', async ({ page, identify }) => {
    const pick = await catalogPick(page)
    identify.answer(diagnosisFor(pick, { withTrait: true, withSizeStage: false }))
    const dialog = await openAddPlant(page)
    await takePhoto(dialog)
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

  test('every size offers every stage; the AI stage stays and nothing else is picked for the owner', async ({ page, identify }) => {
    const pick = await catalogPick(page)
    const base = { ...emptyClassDraft, categoryId: pick.category.id, subcategoryId: pick.sub.id }
    const all = stageChoices(pick.catalog, base)
    const sizes = sizeChoices(pick.catalog, base)
    const size = sizes[sizes.length - 1]
    const answer = diagnosisFor(pick, { withTrait: true, withSizeStage: false })
    // The earliest stage with the largest size: the pair the old size filter used to drop.
    ;(answer.body as { diagnosis: { draft: { stage?: string } } }).diagnosis.draft.stage = all[0]
    identify.answer(answer)

    const dialog = await openAddPlant(page)
    await takePhoto(dialog)
    await dialog.getByRole('button', { name: 'Continue with AI' }).click()
    await expect(dialog.getByRole('navigation').getByRole('button', { name: /Specs, needs input/ })).toBeVisible({
      timeout: 20_000,
    })
    await dialog.getByRole('navigation').getByRole('button', { name: /Specs/ }).click()
    const stages = dialog.getByRole('group', { name: /^stage/i })
    await expect(stages.getByRole('radio')).toHaveCount(all.length)
    await expect(stages.getByRole('radio', { checked: true })).toHaveCount(1)

    await dialog.getByRole('group', { name: /^size/i }).getByRole('radio', { name: size, exact: true }).click()
    await expect(stages.getByRole('radio')).toHaveCount(all.length)
    await expect(stages.getByRole('radio', { checked: true })).toHaveCount(1)
  })

  test('a manual plant gets no stage picked for it, whatever the size', async ({ page }) => {
    const pick = await catalogPick(page)
    const all = stageChoices(pick.catalog, emptyClassDraft)
    const sizes = sizeChoices(pick.catalog, emptyClassDraft)
    const dialog = await openAddPlant(page)
    await takePhoto(dialog)
    await dialog.getByRole('button', { name: 'Fill in manually' }).click()
    await dialog.getByRole('navigation').getByRole('button', { name: /Specs/ }).click()
    const stages = dialog.getByRole('group', { name: /^stage/i })
    for (const size of sizes) {
      await dialog.getByRole('group', { name: /^size/i }).getByRole('radio', { name: size, exact: true }).click({ force: true })
      await expect(stages.getByRole('radio')).toHaveCount(all.length)
      await expect(stages.getByRole('radio', { checked: true })).toHaveCount(0)
    }
  })

  test('a field AI missed is flagged and can be filled from Review', async ({ page, identify }) => {
    const pick = await catalogPick(page)
    const trait = pick.trait.name
    identify.answer(diagnosisFor(pick, { withTrait: false }))
    const dialog = await openAddPlant(page)
    await takePhoto(dialog)
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
    await takePhoto(dialog)
    await dialog.getByRole('button', { name: 'Continue with AI' }).click()

    await expect(dialog.getByText("AI couldn't finish reading this photo", { exact: false })).toBeVisible({ timeout: 20_000 })
    await expect(dialog.getByRole('button', { name: 'Continue with AI' })).toBeDisabled()
    await expect(dialog.getByRole('navigation').getByRole('button', { name: /Identity/ })).toBeEnabled()

    await dialog.getByRole('button', { name: 'Remove photo 1' }).click()
    await takePhoto(dialog)
    await expect(dialog.getByRole('button', { name: 'Continue with AI' })).toBeEnabled()
  })
})

test.describe('Add Plant inside the Google app on an iPhone', () => {
  test.use({
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/380.0.778463337 Mobile/15E148 Safari/604.1',
  })

  test('a blocked camera offers Safari or Chrome', async ({ page }) => {
    await signIn(page)
    // The Google app's browser refuses the camera.
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('Blocked', 'NotAllowedError'))
    })
    const dialog = await openAddPlant(page)
    await dialog.locator('[data-camera-open]:visible').first().click()
    const blocked = page.getByRole('dialog', { name: 'Open PlantX in Safari or Chrome' })
    await expect(blocked).toContainText('inside the Google app')
    await expect(blocked.getByRole('link', { name: 'Open in Safari' })).toHaveAttribute('href', /^x-safari-https?:\/\//)
    await expect(blocked.getByRole('link', { name: 'Open in Chrome' })).toHaveAttribute('href', /^googlechromes?:\/\//)
  })
})
