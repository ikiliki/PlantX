import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Button } from '../../../../components/Button/Button'
import { ChoiceChips } from '../../../../components/ChoiceChips/ChoiceChips'
import { Field, Input, TextArea } from '../../../../components/Form/Form'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { Stepper } from '../../../../components/Stepper/Stepper'
import { useAuth } from '../../../auth/AuthProvider'
import { useI18n } from '../../../../i18n/I18nProvider'
import { createCatalog } from '../../../../mock/catalog'
import { ownerGreenhousePlace } from '../../../../mock/locations'
import { STAGE_LABEL } from '../../../../mock/marketNaming'
import { useStore } from '../../../../mock/store'
import type { CatalogProperty, Diagnosis, PlantClassDraft, SizeBand, StageBand } from '../../../../mock/types'
import { catalogName, optionLabel, propertiesForPlant } from '../../../catalog/catalog'
import { catalogSpecies } from '../../../species/catalogSpecies'
import {
  ADD_PLANT_UPLOAD_LIMIT,
  draftMatchesDiagnosis,
  identificationFor,
  isUsableDiagnosis,
  savedClassFromDraft,
} from '../../identification'
import {
  catalogChoicePhoto,
  emptyClassDraft,
  OTHER_CATEGORY_ID,
  OTHER_SUBCATEGORY_ID,
  otherClass,
  narrowDraft,
  sizeChoices,
  stageChoices,
  subcategoryChoices,
  synthesizeClass,
} from '../../plantClass'
import { useMediaQuery } from '../../../../lib/useMediaQuery'
import { theme } from '../../../../theme/tokens'
import { CatalogPreview } from '../../../species/components/CatalogPreview/CatalogPreview'
import { IdentifyBadge } from '../IdentifyBadge/IdentifyBadge'
import { PhotoChecks } from '../PhotoChecks/PhotoChecks'
import { identifyFacts, PhotoIdentify, wasScanned, type PhotoScan } from '../PhotoIdentify/PhotoIdentify'
import {
  AiAnswer,
  AiFact,
  Banner,
  BannerAction,
  MissingActions,
  MissingField,
  Burst,
  Check,
  CategoryMark,
  ClassCode,
  Done,
  DoneTitle,
  EditLink,
  Footer,
  FooterHint,
  PhotoActions,
  PhotoNote,
  Leaf,
  Review,
  ReviewBody,
  ReviewName,
  PhotoBadge,
  ReviewPhoto,
  ReviewRow,
  ReviewRows,
  Root,
  Scroll,
  Section,
  StepBody,
  StepHead,
  StepLead,
  StepTitle,
} from './AddPlantWizard.styles'

const STEPS = ['photo', 'identity', 'specs', 'details', 'review'] as const
type StepId = (typeof STEPS)[number]

const CATEGORY_SEARCH_MIN = 9
const CHIP_PREVIEW = 4
const AI_MARK = '✦ AI'

function careTip(species: ReturnType<typeof catalogSpecies>, locale: string, light: string) {
  if (!species) return undefined
  const he = locale === 'he'
  const lightLine = he ? species.conditions.lightHe : species.conditions.light
  const lines = [species.scientificName, lightLine ? `${light}: ${lightLine}` : ''].filter(Boolean)
  return lines.length ? lines.join('\n') : undefined
}

function previewOptions<T extends { id: string }>(
  options: T[],
  value: string,
  open: boolean,
  pinId: string,
  keepId?: string,
) {
  if (open || options.length <= CHIP_PREVIEW) return { shown: options, extra: 0 }
  const pin = options.find((item) => item.id === pinId)
  const pool = options.filter((item) => item.id !== pinId)
  const shown = pool.slice(0, pin ? CHIP_PREVIEW - 1 : CHIP_PREVIEW)
  const keep = (id?: string) => {
    if (!id || id === pinId || shown.some((item) => item.id === id)) return
    const item = options.find((option) => option.id === id)
    if (item) shown.push(item)
  }
  keep(value)
  keep(keepId)
  if (pin) shown.push(pin)
  return { shown, extra: options.length - shown.length }
}

function chipMore(
  extra: number,
  open: boolean,
  total: number,
  showMore: string,
  showLess: string,
  setOpen: (next: boolean) => void,
) {
  if (extra > 0) return { label: `${showMore} (${extra})`, onMore: () => setOpen(true) }
  if (open && total > CHIP_PREVIEW) return { label: showLess, onMore: () => setOpen(false) }
  return undefined
}
/** Place comes from greenhouse settings, so the catalog area trait is not asked or saved. */
const AREA_PROPERTY_ID = 'area'
const PLAIN_STEPS_PROPERTY_IDS = ['health', 'size', 'stage', AREA_PROPERTY_ID]

function traitsWithoutArea(traits: Record<string, string>) {
  if (!traits[AREA_PROPERTY_ID]) return traits
  const next = { ...traits }
  delete next[AREA_PROPERTY_ID]
  return next
}
/** Step-by-step Add Plant. A photo is required. AI runs only when the analyze switch is on. */
/** Phone width: chips select on tap; wider screens preview the catalog class first. */
const PHONE_MQ = `(max-width: ${theme.breakpoints.sm})`

export function AddPlantWizard({ onSaved, onClose }: { onSaved?: (plantId: string) => void; onClose?: () => void }) {
  const { db, currentUser, signedIn, addGreenhousePlant } = useStore()
  const { openAuth } = useAuth()
  const { t, locale } = useI18n()
  const catalog = db.catalog ?? createCatalog()
  const topRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const stepRef = useRef(0)
  const descriptionTouchedRef = useRef(false)

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [withAi, setWithAi] = useState(false)
  const [scans, setScans] = useState<PhotoScan[]>([])
  const appliedLead = useRef<string | undefined>(undefined)
  const [draft, setDraft] = useState<PlantClassDraft>(emptyClassDraft)
  const [categoryQuery, setCategoryQuery] = useState('')
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [subsOpen, setSubsOpen] = useState(false)
  /** Category or subcategory chip being previewed from the catalog before it is chosen. */
  const [preview, setPreview] = useState<{ kind: 'category' | 'sub'; id: string } | null>(null)
  const phone = useMediaQuery(PHONE_MQ)
  const [description, setDescription] = useState('')
  const [descriptionTouched, setDescriptionTouched] = useState(false)
  const [savedId, setSavedId] = useState('')
  const [saveFailed, setSaveFailed] = useState(false)
  const [reviewSeen, setReviewSeen] = useState(false)

  const stepId: StepId = STEPS[step]
  useEffect(() => {
    if (stepId === 'review') setReviewSeen(true)
  }, [stepId])
  stepRef.current = step
  descriptionTouchedRef.current = descriptionTouched
  const usable = withAi ? scans.filter((scan) => isUsableDiagnosis(scan.diagnosis)) : []
  const lead = usable.find((scan) => draftMatchesDiagnosis(draft, scan.diagnosis)) ?? usable[0]
  const ai = lead?.diagnosis ?? null
  const recognized = withAi ? (scans.find((scan) => scan.diagnosis?.isPlant)?.diagnosis ?? null) : null
  const missingCatalog = Boolean(recognized && !recognized.draft.categoryId)
  const aiDraft = ai?.draft
  const scanning = scans.some((scan) => scan.phase === 'identifying')
  /** This photo already went to AI (answered or failed). Another try needs another photo. */
  const aiUsed = withAi && scans.some((scan) => wasScanned(scan) && scan.phase !== 'identifying')
  const photos = scans.map((scan) => scan.photo)
  const otherName = recognized?.label || recognized?.scientificName || t.addPlant.otherCategory
  const matched =
    draft.categoryId === OTHER_CATEGORY_ID
      ? otherClass(draft, { name: otherName, nameHe: otherName })
      : synthesizeClass(catalog, draft)
  const storedDraft = {
    ...draft,
    subcategoryId: draft.subcategoryId === OTHER_SUBCATEGORY_ID ? '' : draft.subcategoryId,
  }
  const identification = identificationFor(
    savedClassFromDraft(storedDraft, catalog),
    scans.map((scan) => ({
      scanned: withAi && wasScanned(scan),
      diagnosis: withAi ? scan.diagnosis : undefined,
      requestId: withAi ? scan.requestId : undefined,
    })),
    catalog,
  )
  const followsAi = draftMatchesDiagnosis(draft, ai)

  const varieties = subcategoryChoices(catalog, draft)
  const sizes = sizeChoices(catalog, draft)
  const stages = stageChoices(catalog, draft)
  const requiredExtra = requiredTraits(draft)
  /** Names of the Specs fields still empty, in the order Specs shows them. */
  const missingSpecs = [
    !draft.size ? t.admin.size : '',
    !draft.stage ? t.admin.stage : '',
    ...requiredExtra.filter((item) => !draft.traits[item.id]).map((item) => catalogName(item, locale)),
  ].filter(Boolean)

  // Other shows no traits on Specs, so it cannot require one.
  function requiredTraits(value: PlantClassDraft) {
    if (value.categoryId === OTHER_CATEGORY_ID) return []
    return propertiesForPlant(catalog, value.categoryId, value.subcategoryId, true).filter(
      (item) => !PLAIN_STEPS_PROPERTY_IDS.includes(item.id),
    )
  }

  const categories = useMemo(() => {
    const needle = categoryQuery.trim().toLowerCase()
    return catalog.categories.filter(
      (item) =>
        !needle ||
        item.id === draft.categoryId ||
        `${item.name} ${item.nameHe} ${item.ticker}`.toLowerCase().includes(needle),
    )
  }, [catalog.categories, categoryQuery, draft.categoryId])

  useEffect(() => {
    if (!matched || descriptionTouched) return
    const observed = locale === 'he' ? matched.observedHe : matched.observed
    const name = locale === 'he' ? matched.nameHe : matched.name
    setDescription(observed.trim() || name)
  }, [matched, locale, descriptionTouched])

  const setClass = (partial: Partial<PlantClassDraft>) => {
    setDraft((current) => narrowDraft(catalog, { ...current, ...partial }, { fillSingle: !withAi }))
  }

  const draftFromDiagnosis = (diagnosis: Diagnosis) => {
    const hasCategory = Boolean(diagnosis.draft.categoryId)
    // Only what the AI answered is filled. Anything else stays empty and is flagged for the owner,
    // so a value the AI never suggested is not presented (or stamped) as an AI answer.
    const next = narrowDraft(
      catalog,
      {
        ...emptyClassDraft,
        ...diagnosis.draft,
        categoryId: hasCategory ? (diagnosis.draft.categoryId ?? OTHER_CATEGORY_ID) : OTHER_CATEGORY_ID,
        // Subcategory is required. An answer with no variety gets Other: that is the AI's suggestion.
        subcategoryId: hasCategory ? diagnosis.draft.subcategoryId || OTHER_SUBCATEGORY_ID : '',
        traits: { ...diagnosis.draft.traits },
      },
      { fillSingle: false },
    )
    // A variety id the catalog no longer has can still narrow to empty: Other, not empty.
    if (!next.subcategoryId) next.subcategoryId = OTHER_SUBCATEGORY_ID
    return next
  }

  const applyAi = (source: Diagnosis) => {
    setDraft(draftFromDiagnosis(source))
  }

  // A plant answer fills every later step and slides to review, only while AI is on.
  const plantScan = withAi ? scans.find((scan) => scan.diagnosis?.isPlant) : undefined
  useEffect(() => {
    if (!withAi || !plantScan?.diagnosis || appliedLead.current === plantScan.id) return
    appliedLead.current = plantScan.id
    const diagnosis = plantScan.diagnosis
    const next = draftFromDiagnosis(diagnosis)
    setDraft(next)
    const label = diagnosis.label || diagnosis.scientificName || ''
    const named =
      next.categoryId === OTHER_CATEGORY_ID
        ? otherClass(next, { name: label || 'Other', nameHe: label || 'Other' })
        : synthesizeClass(catalog, next)
    if (named && !descriptionTouchedRef.current) {
      const observed = locale === 'he' ? named.observedHe : named.observed
      const plantName = locale === 'he' ? named.nameHe : named.name
      setDescription((observed.trim() || plantName).trim())
    }
    // Always Review: anything AI left empty is listed there and flagged on its step.
    if (stepRef.current === 0) {
      setDirection(1)
      setStep(STEPS.length - 1)
      scrollRef.current?.scrollTo({ top: 0 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantScan?.id, withAi])

  // A new photo is a fresh start for AI: it waits for Continue with AI again.
  const scansRef = useRef(scans)
  scansRef.current = scans
  const changeScans: typeof setScans = (update) => {
    const current = scansRef.current
    const next = typeof update === 'function' ? update(current) : update
    if (next.some((scan) => !current.some((item) => item.id === scan.id))) setWithAi(false)
    setScans(update)
  }

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1)
    setStep(Math.max(0, Math.min(next, STEPS.length - 1)))
    scrollRef.current?.scrollTo({ top: 0 })
  }

  const isOther = draft.categoryId === OTHER_CATEGORY_ID
  const isOtherSub = draft.subcategoryId === OTHER_SUBCATEGORY_ID
  const selectedCategory = catalog.categories.find((item) => item.id === draft.categoryId)
  const selectedSub = catalog.subcategories.find((item) => item.id === draft.subcategoryId)
  const identityPhoto = isOther ? photos[0] || '' : catalogChoicePhoto(catalog, draft) || selectedCategory?.photo || ''
  const identityReady = Boolean(draft.categoryId) && (isOtherSub || Boolean(selectedSub))
  const specsReady =
    Boolean(draft.size && draft.stage) && requiredExtra.every((item) => draft.traits[item.id])
  const detailsReady = Boolean(description.trim() && matched)
  const reviewReady = identityReady && specsReady && detailsReady
  const specsHint = t.addPlant.needFields.replace('{fields}', missingSpecs.join(', ').toLocaleLowerCase(locale))
  /** Every empty required field, with the step that fills it. */
  const missing: { id: string; label: string; step: StepId }[] = [
    ...(!draft.categoryId ? [{ id: 'category', label: t.admin.category, step: 'identity' as const }] : []),
    ...(draft.categoryId && !identityReady
      ? [{ id: 'subcategory', label: t.admin.subcategory, step: 'identity' as const }]
      : []),
    ...(!draft.size ? [{ id: 'size', label: t.admin.size, step: 'specs' as const }] : []),
    ...(!draft.stage ? [{ id: 'stage', label: t.admin.stage, step: 'specs' as const }] : []),
    ...requiredExtra
      .filter((item) => !draft.traits[item.id])
      .map((item) => ({ id: item.id, label: catalogName(item, locale), step: 'specs' as const })),
    ...(!description.trim() ? [{ id: 'description', label: t.greenhouse.addDescription, step: 'details' as const }] : []),
  ]
  // Flag gaps once there is an answer to compare with (AI ran) or the grower has seen Review.
  const flagMissing = Boolean(recognized) || reviewSeen
  const missingNote = recognized ? t.addPlant.aiMissedField : t.addPlant.requiredField
  const isMissing = (id: string) => flagMissing && missing.some((item) => item.id === id)
  const flaggedSteps = flagMissing ? [...new Set(missing.map((item) => item.step))] : []
  // After a photo every step is open, except while the AI is still reading it.
  // Navigation is open even with no photo (the manual flow); a photo is required only to approve.
  const freeNav = !(scanning && !ai)
  const place = ownerGreenhousePlace(signedIn ? currentUser : null)

  // A plant is named like a plant ("Pothos Golden"), not by its class code; the code stays on the passport.
  const plantTitle = (() => {
    if (isOther) return { en: otherName, he: otherName }
    const category = catalog.categories.find((item) => item.id === draft.categoryId)
    const sub = isOtherSub ? undefined : catalog.subcategories.find((item) => item.id === draft.subcategoryId)
    if (!category) return { en: matched?.name ?? '', he: matched?.nameHe ?? '' }
    return {
      en: sub ? `${category.name} ${sub.name}` : category.name,
      he: sub ? `${category.nameHe} ${sub.nameHe}` : category.nameHe,
    }
  })()

  const save = () => {
    if (!signedIn) {
      openAuth('buy')
      return
    }
    if (!matched || !description.trim()) {
      setSaveFailed(true)
      return
    }
    // A photo is optional through the steps but required to approve the plant.
    if (photos.length === 0) {
      setSaveFailed(true)
      return
    }
    const traits = traitsWithoutArea(draft.traits)
    if (isOther) {
      if (!draft.size || !draft.stage) {
        setSaveFailed(true)
        return
      }
      const id = addGreenhousePlant({
        title: plantTitle.en,
        titleHe: plantTitle.he,
        description: descriptionTouched ? description : matched.observed,
        descriptionHe: descriptionTouched ? description : matched.observedHe,
        photos,
        speciesId: OTHER_CATEGORY_ID,
        variety: matched.variety,
        varietyHe: matched.varietyHe,
        quality: draft.quality,
        sizeBand: draft.size,
        stage: draft.stage,
        code: matched.code,
        traits,
        location: place,
        identification,
        identifyRequestIds: withAi ? scans.map((scan) => scan.requestId) : [],
      })
      if (id) setSavedId(id)
      else setSaveFailed(true)
      return
    }
    const category = catalog.categories.find((item) => item.id === draft.categoryId)
    const species = db.species.find((item) => item.id === category?.speciesId)
    const sub = isOtherSub ? undefined : catalog.subcategories.find((item) => item.id === draft.subcategoryId)
    if (!category || !draft.size || !draft.stage) {
      setSaveFailed(true)
      return
    }
    const id = addGreenhousePlant({
      title: plantTitle.en,
      titleHe: plantTitle.he,
      description: descriptionTouched ? description : matched.observed,
      descriptionHe: descriptionTouched ? description : matched.observedHe,
      photos,
      speciesId: species?.id ?? category.speciesId,
      variety: isOtherSub ? 'Other' : (sub?.name ?? category.name),
      varietyHe: isOtherSub ? 'אחר' : (sub?.nameHe ?? category.nameHe),
      quality: draft.quality,
      sizeBand: draft.size,
      stage: draft.stage,
      code: matched.code,
      marketClassId: db.marketClasses.find((item) => item.code === matched.code)?.id,
      subcategoryId: isOtherSub ? undefined : draft.subcategoryId || undefined,
      traits,
      location: place,
      identification,
      identifyRequestIds: withAi ? scans.map((scan) => scan.requestId) : [],
    })
    if (id) setSavedId(id)
    else setSaveFailed(true)
  }

  const reset = () => {
    setStep(0)
    setDirection(-1)
    setWithAi(false)
    setScans([])
    appliedLead.current = undefined
    setDraft(emptyClassDraft)
    setCategoryQuery('')
    setDescription('')
    setDescriptionTouched(false)
    setSavedId('')
    setSaveFailed(false)
    setReviewSeen(false)
  }

  if (savedId) {
    const name = matched ? (locale === 'he' ? matched.nameHe : matched.name) : ''
    return (
      <Root>
        <Done role="status">
          <Burst aria-hidden>
            {Array.from({ length: 10 }, (_, index) => (
              <Leaf key={index} style={{ '--i': index } as CSSProperties} />
            ))}
            <Check>✓</Check>
          </Burst>
          <DoneTitle>{t.addPlant.doneTitle}</DoneTitle>
          <StepLead>{t.addPlant.doneBody.replace('{name}', name)}</StepLead>
          <IdentifyBadge identification={identification} notInCatalog={isOther} />
          <Footer $static>
            <Button type="button" variant="secondary" onClick={reset}>
              {t.addPlant.addAnother}
            </Button>
            <Button type="button" variant="growth" onClick={() => (onSaved ? onSaved(savedId) : onClose?.())}>
              {t.addPlant.done}
            </Button>
          </Footer>
        </Done>
      </Root>
    )
  }

  const banner = (() => {
    if (ai && followsAi) {
      return (
        <Banner $tone="ai">
          <span>{t.addPlant.bannerAi}</span>
        </Banner>
      )
    }
    // AI recognized a plant the catalog does not have: Other keeps it AI verified.
    if (!ai && missingCatalog) {
      return isOther ? (
        <Banner $tone="ai">
          <span>{t.addPlant.bannerAiOther.replace('{label}', otherName)}</span>
        </Banner>
      ) : (
        <Banner $tone="warn">
          <span>{t.addPlant.bannerEdited}</span>
        </Banner>
      )
    }
    if (ai && !followsAi) {
      return (
        <Banner $tone="warn">
          <span>{t.addPlant.bannerEdited}</span>
          <BannerAction type="button" onClick={() => applyAi(ai)}>
            {t.addPlant.restoreAi}
          </BannerAction>
        </Banner>
      )
    }
    return (
      <Banner $tone="manual">
        <span>{t.addPlant.bannerManual}</span>
      </Banner>
    )
  })()

  const stepLabels: Record<StepId, string> = {
    photo: t.addPlant.stepPhoto,
    identity: t.addPlant.stepIdentity,
    specs: t.addPlant.stepSpecs,
    details: t.addPlant.stepDetails,
    review: t.addPlant.stepReview,
  }

  const chooseCategory = (value: string) => {
    setSubsOpen(false)
    setClass({ categoryId: value, subcategoryId: '', quality: '', size: '', stage: '', traits: {} })
  }
  const chooseSub = (value: string) => setClass({ subcategoryId: value, quality: '', size: '', stage: '' })

  const previewCategory = preview
    ? catalog.categories.find((item) =>
        preview.kind === 'category'
          ? item.id === preview.id
          : item.id === catalog.subcategories.find((sub) => sub.id === preview.id)?.categoryId,
      )
    : undefined
  const previewPopup =
    preview && previewCategory ? (
      <CatalogPreview
        speciesId={previewCategory.speciesId}
        subcategoryId={preview.kind === 'sub' ? preview.id : undefined}
        infoOnly
        onClose={() => setPreview(null)}
      />
    ) : null

  const body = (() => {
    switch (stepId) {
      case 'photo':
        return null
      case 'identity': {
        const searching = Boolean(categoryQuery.trim())
        const categoryOptions = [
          ...categories.map((item) => ({
            id: item.id,
            label: catalogName(item, locale),
            photo: item.photo,
            tip: phone
              ? undefined
              : careTip(catalogSpecies(db, item.speciesId), locale, t.plant.light),
          })),
          ...(searching && !t.addPlant.otherCategory.toLowerCase().includes(categoryQuery.trim().toLowerCase())
            ? []
            : [{ id: OTHER_CATEGORY_ID, label: t.addPlant.otherCategory }]),
        ]
        const categoryList = previewOptions(
          categoryOptions,
          draft.categoryId,
          categoriesOpen || searching,
          OTHER_CATEGORY_ID,
          aiDraft?.categoryId || (missingCatalog ? OTHER_CATEGORY_ID : undefined),
        )
        const subOptions = draft.categoryId
          ? [
              ...varieties.map((item) => ({
                id: item.id,
                label: catalogName(item, locale),
                photo: item.photo,
                tip: phone
                  ? undefined
                  : careTip(
                      catalogSpecies(db, selectedCategory?.speciesId ?? ''),
                      locale,
                      t.plant.light,
                    ),
              })),
              { id: OTHER_SUBCATEGORY_ID, label: t.addPlant.otherCategory },
            ]
          : []
        const subList = previewOptions(
          subOptions,
          draft.subcategoryId,
          subsOpen,
          OTHER_SUBCATEGORY_ID,
          aiDraft?.categoryId === draft.categoryId ? aiDraft.subcategoryId : undefined,
        )
        return (
          <>
            <StepHead>
              <StepTitle>{t.addPlant.identityTitle}</StepTitle>
              {ai || phone ? (
                <StepLead>{ai ? t.addPlant.identityLeadAi : t.addPlant.identityLeadManual}</StepLead>
              ) : null}
            </StepHead>
            {banner}
            <Section>
              {catalog.categories.length >= CATEGORY_SEARCH_MIN ? (
                <Input
                  type="search"
                  value={categoryQuery}
                  placeholder={t.addPlant.searchCategories}
                  aria-label={t.addPlant.searchCategories}
                  onChange={(event) => setCategoryQuery(event.target.value)}
                />
              ) : null}
              <ChoiceChips
                label={t.admin.category}
                required
                missing={isMissing('category') ? missingNote : undefined}
                value={draft.categoryId}
                suggestedId={aiDraft?.categoryId || (missingCatalog ? OTHER_CATEGORY_ID : undefined)}
                suggestedLabel={AI_MARK}
                options={categoryList.shown}
                more={
                  searching
                    ? undefined
                    : chipMore(
                        categoryList.extra,
                        categoriesOpen,
                        categoryOptions.length,
                        t.addPlant.showMore,
                        t.addPlant.showLess,
                        setCategoriesOpen,
                      )
                }
                onChange={chooseCategory}
                onTip={(id) => {
                  if (id !== OTHER_CATEGORY_ID) setPreview({ kind: 'category', id })
                }}
              />
            </Section>
            <Section>
              <ChoiceChips
                label={t.admin.subcategory}
                required
                missing={isMissing('subcategory') ? missingNote : undefined}
                disabled={!draft.categoryId}
                value={draft.subcategoryId}
                suggestedId={
                  aiDraft?.categoryId === draft.categoryId
                    ? aiDraft.subcategoryId || (varieties.length === 0 ? OTHER_SUBCATEGORY_ID : undefined)
                    : undefined
                }
                suggestedLabel={AI_MARK}
                options={subList.shown}
                more={chipMore(
                  subList.extra,
                  subsOpen,
                  subOptions.length,
                  t.addPlant.showMore,
                  t.addPlant.showLess,
                  setSubsOpen,
                )}
                emptyLabel={t.addPlant.subcategoryFirst}
                onChange={chooseSub}
                onTip={(id) => {
                  if (id !== OTHER_SUBCATEGORY_ID) setPreview({ kind: 'sub', id })
                }}
              />
            </Section>
          </>
        )
      }
      case 'specs': {
        const traitOpen = (property: CatalogProperty) => {
          if (!draft.stage || isOther) return false
          if (property.subcategoryIds.length > 0) return property.subcategoryIds.includes(draft.subcategoryId)
          return property.categoryIds.length === 0 || property.categoryIds.includes(draft.categoryId)
        }
        const specTraits =
          !draft.categoryId || isOther
            ? []
            : catalog.properties.filter((item) => {
                if (PLAIN_STEPS_PROPERTY_IDS.includes(item.id)) return false
                if (item.categoryIds.includes(draft.categoryId)) return true
                return item.subcategoryIds.some((id) =>
                  catalog.subcategories.some((sub) => sub.id === id && sub.categoryId === draft.categoryId),
                )
              })
        return (
          <>
            <StepHead>
              <StepTitle>{t.addPlant.specsTitle}</StepTitle>
              <StepLead>{t.addPlant.specsLead}</StepLead>
            </StepHead>
            <Section>
              <ChoiceChips
                label={t.admin.size}
                required
                missing={isMissing('size') ? missingNote : undefined}
                value={draft.size}
                suggestedId={aiDraft?.size || undefined}
                suggestedLabel={AI_MARK}
                options={sizes.map((size) => ({ id: size, label: size }))}
                onChange={(value) => setClass({ size: value as SizeBand | '', stage: '' })}
              />
            </Section>
            <Section>
              <ChoiceChips
                label={t.admin.stage}
                required
                missing={draft.size && isMissing('stage') ? missingNote : undefined}
                disabled={!draft.size}
                value={draft.size ? draft.stage : ''}
                suggestedId={aiDraft?.stage || undefined}
                suggestedLabel={AI_MARK}
                options={
                  draft.size
                    ? stages.map((stage) => ({
                        id: stage,
                        label: STAGE_LABEL[stage as StageBand]?.[locale] ?? stage,
                      }))
                    : []
                }
                emptyLabel={t.addPlant.sizeFirst}
                onChange={(value) => setClass({ stage: value as StageBand | '' })}
              />
            </Section>
            {specTraits.map((property) => {
              const open = traitOpen(property)
              return (
                <Section key={property.id}>
                  <ChoiceChips
                    label={catalogName(property, locale)}
                    required={property.required}
                    missing={open && property.required && isMissing(property.id) ? missingNote : undefined}
                    disabled={!open}
                    value={open ? (draft.traits[property.id] ?? '') : ''}
                    suggestedId={aiDraft?.traits?.[property.id]}
                    suggestedLabel={AI_MARK}
                    options={
                      open
                        ? property.options.map((option) => ({
                            id: option.id,
                            label: optionLabel(option, locale),
                          }))
                        : []
                    }
                    emptyLabel={
                      !draft.size
                        ? t.addPlant.sizeFirst
                        : !draft.stage
                          ? t.addPlant.stageFirst
                          : t.addPlant.traitNotForVariety
                    }
                    onChange={(value) =>
                      setClass({
                        traits: { ...draft.traits, [property.id]: value },
                      })
                    }
                  />
                </Section>
              )
            })}
          </>
        )
      }
      case 'details':
        return (
          <>
            <StepHead>
              <StepTitle>{t.addPlant.detailsTitle}</StepTitle>
              <StepLead>{t.addPlant.detailsLead}</StepLead>
            </StepHead>
            {matched ? <ClassCode title={t.greenhouse.classWord}>{matched.code}</ClassCode> : null}
            <Field data-missing={isMissing('description') ? 'true' : undefined}>
              {t.greenhouse.addDescription}
              {isMissing('description') ? <MissingField>{missingNote}</MissingField> : null}
              <TextArea
                value={description}
                required
                placeholder={t.addPlant.descriptionPlaceholder}
                onChange={(event) => {
                  setDescriptionTouched(true)
                  setDescription(event.target.value)
                }}
              />
            </Field>
          </>
        )
      case 'review': {
        const category = catalog.categories.find((item) => item.id === draft.categoryId)
        const sub = catalog.subcategories.find((item) => item.id === draft.subcategoryId)
        const rows: { label: string; value: string; step: StepId }[] = [
          {
            label: t.admin.category,
            value: isOther ? t.addPlant.otherCategory : category ? catalogName(category, locale) : '—',
            step: 'identity',
          },
          {
            label: t.admin.subcategory,
            value: isOtherSub ? t.addPlant.otherCategory : sub ? catalogName(sub, locale) : '—',
            step: 'identity',
          },
          { label: t.admin.size, value: draft.size, step: 'specs' },
          {
            label: t.admin.stage,
            value: draft.stage ? (STAGE_LABEL[draft.stage]?.[locale] ?? draft.stage) : '',
            step: 'specs',
          },
          // Required traits are on Review too, so a missing one is visible with its Edit link.
          ...requiredExtra.map((property) => {
            const option = property.options.find((item) => item.id === draft.traits[property.id])
            return {
              label: catalogName(property, locale),
              value: option ? optionLabel(option, locale) : '',
              step: 'specs' as StepId,
            }
          }),
        ]
        const plantPhoto = photos[0] || ''
        const catalogPhoto = identityPhoto && identityPhoto !== plantPhoto ? identityPhoto : ''
        const hero = plantPhoto || identityPhoto
        return (
          <>
            <StepHead>
              <StepTitle>{reviewReady ? t.addPlant.reviewTitle : t.addPlant.reviewTitleMissing}</StepTitle>
              <StepLead>{reviewReady ? t.addPlant.reviewLead : t.addPlant.reviewLeadMissing}</StepLead>
            </StepHead>
            {missing.length > 0 ? (
              <Banner $tone="warn" role="status">
                <span>{recognized ? t.addPlant.aiMissedTitle : t.addPlant.stillMissingTitle}</span>
                <MissingActions>
                  {missing.map((item) => (
                    <BannerAction key={item.id} type="button" onClick={() => go(STEPS.indexOf(item.step))}>
                      {item.label}
                    </BannerAction>
                  ))}
                </MissingActions>
              </Banner>
            ) : null}
            <Review>
              <ReviewPhoto $drop={!plantPhoto}>
                {plantPhoto ? (
                  <>
                    <PlantImage src={hero} alt="" />
                    {catalogPhoto ? (
                      <CategoryMark>
                        <PlantImage src={catalogPhoto} alt="" />
                      </CategoryMark>
                    ) : null}
                    {/* Stamped on the photo, like the passport gallery. */}
                    <PhotoBadge>
                      <IdentifyBadge identification={identification} notInCatalog={isOther} />
                    </PhotoBadge>
                  </>
                ) : (
                  // No photo yet: the required photo is added here, in the same drop control, sized to the slot.
                  <PhotoIdentify
                    scans={scans}
                    onScansChange={setScans}
                    checks={identification.photos}
                    max={ADD_PLANT_UPLOAD_LIMIT}
                    analyze={withAi}
                    showAnswer={false}
                  />
                )}
              </ReviewPhoto>
              <ReviewBody>
                {photos.length > 1 ? <PhotoChecks photos={photos} checks={identification.photos} size="sm" /> : null}
                <ReviewName>{matched ? (locale === 'he' ? matched.nameHe : matched.name) : ''}</ReviewName>
                {matched ? <ClassCode>{matched.code}</ClassCode> : null}
                <ReviewRows>
                  {rows.map((row) => (
                    <ReviewRow key={row.label} data-missing={row.value ? undefined : 'true'}>
                      <dt>{row.label}</dt>
                      <dd>{row.value || t.addPlant.missingValue}</dd>
                      <EditLink type="button" onClick={() => go(STEPS.indexOf(row.step))}>
                        {t.addPlant.edit}
                      </EditLink>
                    </ReviewRow>
                  ))}
                </ReviewRows>
                {recognized ? (
                  <AiAnswer>
                    <strong>{t.addPlant.resultTitle}</strong>
                    {identifyFacts(recognized, catalog, locale, t).map((fact) => (
                      <AiFact key={fact.id}>
                        <span>{fact.label}</span>
                        {fact.value}
                      </AiFact>
                    ))}
                  </AiAnswer>
                ) : null}
                {description ? <StepLead>{description}</StepLead> : null}
              </ReviewBody>
            </Review>
          </>
        )
      }
    }
  })()

  const next = (() => {
    switch (stepId) {
      case 'photo':
        // Both buttons wait for a photo; say so instead of leaving them silently disabled.
        return { label: '', disabled: true, hint: scans.length === 0 ? t.addPlant.needPhoto : '' }
      // Next stays open so the grower can move freely; the hint says what is still empty. Only Save waits.
      case 'identity':
        return {
          label: t.addPlant.next,
          disabled: !freeNav,
          hint: identityReady || !phone ? '' : t.addPlant.needIdentity,
        }
      case 'specs':
        return {
          label: t.addPlant.next,
          disabled: !freeNav,
          hint: specsReady ? '' : specsHint,
        }
      case 'details':
        return {
          label: t.addPlant.next,
          disabled: !freeNav,
          hint: detailsReady ? '' : t.addPlant.needDetails,
        }
      case 'review':
        return {
          label: t.greenhouse.savePlant,
          disabled: !reviewReady || photos.length === 0,
          hint: saveFailed
            ? t.addPlant.saveFailed
            : !identityReady
              ? t.addPlant.needIdentity
              : !specsReady
                ? specsHint
                : !detailsReady
                  ? t.addPlant.needDetails
                  : photos.length === 0
                    ? t.addPlant.needReviewPhoto
                    : '',
        }
    }
  })()

  return (
    <Root ref={topRef}>
      <Stepper
        steps={STEPS.map((id) => ({ id, label: stepLabels[id] }))}
        current={step}
        onStep={(index) => (scanning && !ai ? undefined : go(index))}
        ariaLabel={t.greenhouse.add}
        open={freeNav}
        flagged={flaggedSteps.filter((id) => id !== stepId)}
        flaggedLabel={t.addPlant.stepNeedsInput}
      />
      <Scroll ref={scrollRef}>
        <StepBody key={stepId} $direction={direction}>
          {body}
          {previewPopup}
        </StepBody>
        {/* Stays mounted so the scan result survives a trip to later steps and back. */}
        <div hidden={stepId !== 'photo'}>
          <PhotoIdentify
            scans={scans}
            onScansChange={changeScans}
            checks={identification.photos}
            max={ADD_PLANT_UPLOAD_LIMIT}
            analyze={withAi}
            showAnswer={false}
          />
          {/* Only before a photo: once added, the scan card says what to do next. */}
          {scans.length === 0 ? (
            <PhotoNote>{ADD_PLANT_UPLOAD_LIMIT > 1 ? t.addPlant.photoLead : t.addPlant.photoLeadOne}</PhotoNote>
          ) : null}
        </div>
      </Scroll>
      <Footer $static>
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={() => go(step - 1)}>
            {t.addPlant.back}
          </Button>
        ) : (
          <span />
        )}
        {next.hint ? (
          <FooterHint
            $tone={stepId === 'review' && saveFailed ? 'bad' : 'muted'}
            role={saveFailed ? 'alert' : undefined}
          >
            {next.hint}
          </FooterHint>
        ) : null}
        {stepId === 'photo' ? (
          <PhotoActions>
            <Button
              type="button"
              variant="secondary"
              disabled={scanning}
              onClick={() => {
                // After a scan the answer stays; the grower edits it from here.
                if (!aiUsed) setWithAi(false)
                go(step + 1)
              }}
            >
              {t.addPlant.fillManually}
            </Button>
            <Button
              type="button"
              variant="info"
              disabled={scans.length === 0 || scanning || aiUsed}
              onClick={() => {
                if (!signedIn) {
                  openAuth('buy')
                  return
                }
                setWithAi(true)
              }}
            >
              {scanning ? t.addPlant.aiWorking : t.addPlant.continueWithAi}
            </Button>
          </PhotoActions>
        ) : (
          <Button
            type="button"
            variant={stepId === 'review' ? 'growth' : 'primary'}
            disabled={next.disabled}
            onClick={() => (stepId === 'review' ? save() : go(step + 1))}
          >
            {next.label}
          </Button>
        )}
      </Footer>
    </Root>
  )
}
