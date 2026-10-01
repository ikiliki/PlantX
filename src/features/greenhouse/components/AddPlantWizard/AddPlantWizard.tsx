import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Button } from '../../../../components/Button/Button'
import { ChoiceChips } from '../../../../components/ChoiceChips/ChoiceChips'
import { Field, Input, TextArea } from '../../../../components/Form/Form'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { Stepper } from '../../../../components/Stepper/Stepper'
import { useI18n } from '../../../../i18n/I18nProvider'
import { createCatalog } from '../../../../mock/catalog'
import { AREAS, areaById, greenhousePlace } from '../../../../mock/locations'
import { STAGE_LABEL } from '../../../../mock/marketNaming'
import { useStore } from '../../../../mock/store'
import type { Diagnosis, PlantClassDraft, SizeBand, StageBand } from '../../../../mock/types'
import { catalogName, optionLabel, propertiesForPlant } from '../../../catalog/catalog'
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
  otherClass,
  narrowDraft,
  sizeChoices,
  stageChoices,
  subcategoryChoices,
  synthesizeClass,
} from '../../plantClass'
import { IdentifyBadge } from '../IdentifyBadge/IdentifyBadge'
import { PhotoChecks } from '../PhotoChecks/PhotoChecks'
import { PhotoIdentify, wasScanned, type PhotoScan } from '../PhotoIdentify/PhotoIdentify'
import {
  Banner,
  BannerAction,
  Burst,
  Check,
  CategoryMark,
  ClassCode,
  Done,
  DoneTitle,
  EditLink,
  Footer,
  FooterHint,
  IdentityCard,
  IdentityCopy,
  IdentityPhoto,
  Leaf,
  More,
  Review,
  ReviewBody,
  ReviewName,
  ReviewPhoto,
  ReviewRow,
  ReviewRows,
  Root,
  Section,
  StepBody,
  StepHead,
  StepLead,
  StepTitle,
} from './AddPlantWizard.styles'

const STEPS = ['photo', 'identity', 'specs', 'details', 'review'] as const
type StepId = (typeof STEPS)[number]

const CATEGORY_SEARCH_MIN = 9
const AI_MARK = '✦ AI'
/** The catalog area trait is the Location answer, so it is not asked twice. */
const AREA_PROPERTY_ID = 'area'
const PLAIN_STEPS_PROPERTY_IDS = ['grade', 'size', 'stage', AREA_PROPERTY_ID]
/** Shown when a category has no subcategory. It is not stored on the draft. */
const NO_SUBCATEGORY = 'none'

/** Step-by-step Add Plant. A photo runs the identify chain; every AI answer stays editable and the saved plant records who identified it. */
export function AddPlantWizard({ onSaved, onClose }: { onSaved?: (plantId: string) => void; onClose?: () => void }) {
  const { db, currentUser, signedIn, addGreenhousePlant } = useStore()
  const { t, locale } = useI18n()
  const ownerId = signedIn && currentUser ? currentUser.id : db.visitorId
  const home = greenhousePlace({
    user: currentUser,
    signedIn,
    ownerId,
    plants: db.plants,
  })
  const defaultAreaId = AREAS.find((area) => area.region === home?.region)?.id ?? ''
  const catalog = db.catalog ?? createCatalog()
  const topRef = useRef<HTMLDivElement>(null)
  const stepRef = useRef(0)
  const descriptionTouchedRef = useRef(false)

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [scans, setScans] = useState<PhotoScan[]>([])
  const appliedLead = useRef<string | undefined>(undefined)
  const [draft, setDraft] = useState<PlantClassDraft>(emptyClassDraft)
  const [categoryQuery, setCategoryQuery] = useState('')
  const [moreOpen, setMoreOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [descriptionTouched, setDescriptionTouched] = useState(false)
  const [areaId, setAreaId] = useState(defaultAreaId)
  const [savedId, setSavedId] = useState('')
  const [saveFailed, setSaveFailed] = useState(false)

  const stepId: StepId = STEPS[step]
  stepRef.current = step
  descriptionTouchedRef.current = descriptionTouched
  const usable = scans.filter((scan) => isUsableDiagnosis(scan.diagnosis))
  const lead = usable.find((scan) => draftMatchesDiagnosis(draft, scan.diagnosis)) ?? usable[0]
  const ai = lead?.diagnosis ?? null
  const recognized = scans.find((scan) => scan.diagnosis?.isPlant)?.diagnosis ?? null
  const missingCatalog = Boolean(recognized && !recognized.draft.categoryId)
  const aiDraft = ai?.draft
  const scanning = scans.some((scan) => scan.phase === 'identifying')
  const photos = scans.map((scan) => scan.photo)
  const otherName = recognized?.label || recognized?.scientificName || t.addPlant.otherCategory
  const matched =
    draft.categoryId === OTHER_CATEGORY_ID
      ? otherClass(draft, { name: otherName, nameHe: otherName })
      : synthesizeClass(catalog, draft)
  const identification = identificationFor(
    savedClassFromDraft(draft, catalog),
    scans.map((scan) => ({ scanned: wasScanned(scan), diagnosis: scan.diagnosis, requestId: scan.requestId })),
    catalog,
  )
  const followsAi = draftMatchesDiagnosis(draft, ai)

  const varieties = subcategoryChoices(catalog, draft)
  const sizes = sizeChoices(catalog, draft)
  const stages = stageChoices(catalog, draft)
  const requiredExtra = propertiesForPlant(catalog, draft.categoryId, draft.subcategoryId, true).filter(
    (item) => !PLAIN_STEPS_PROPERTY_IDS.includes(item.id),
  )
  const optionalProps = propertiesForPlant(catalog, draft.categoryId, draft.subcategoryId, false).filter(
    (item) => item.id !== AREA_PROPERTY_ID,
  )
  const areaProperty = propertiesForPlant(catalog, draft.categoryId, draft.subcategoryId, true).find(
    (item) => item.id === AREA_PROPERTY_ID,
  )

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
    setDraft((current) => narrowDraft(catalog, { ...current, ...partial }))
  }

  const draftFromDiagnosis = (diagnosis: Diagnosis) => {
    const hasCategory = Boolean(diagnosis.draft.categoryId)
    const next = narrowDraft(catalog, {
      ...emptyClassDraft,
      ...diagnosis.draft,
      categoryId: hasCategory ? (diagnosis.draft.categoryId ?? OTHER_CATEGORY_ID) : OTHER_CATEGORY_ID,
      subcategoryId: hasCategory ? (diagnosis.draft.subcategoryId ?? '') : '',
      traits: { ...diagnosis.draft.traits },
    })
    // Review needs a size and a stage. Use the answer when it has one, otherwise the first choice.
    if (!next.size) {
      const band = sizeChoices(catalog, next)[0]
      if (band) next.size = band
    }
    if (!next.stage) {
      const band = stageChoices(catalog, next)[0]
      if (band) next.stage = band
    }
    return next
  }

  const applyAi = (source: Diagnosis) => {
    setDraft(draftFromDiagnosis(source))
  }

  // The first plant answer fills every later step and slides to review.
  const plantScan = scans.find((scan) => scan.diagnosis?.isPlant)
  useEffect(() => {
    if (!plantScan?.diagnosis || appliedLead.current === plantScan.id) return
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
    if (stepRef.current === 0) {
      setDirection(1)
      setStep(STEPS.length - 1)
      topRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantScan?.id])

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1)
    setStep(Math.max(0, Math.min(next, STEPS.length - 1)))
    topRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  const isOther = draft.categoryId === OTHER_CATEGORY_ID
  const selectedCategory = catalog.categories.find((item) => item.id === draft.categoryId)
  const selectedSub = catalog.subcategories.find((item) => item.id === draft.subcategoryId)
  const identityPhoto = isOther ? photos[0] || '' : catalogChoicePhoto(catalog, draft) || selectedCategory?.photo || ''
  const identityReady = isOther || (Boolean(draft.categoryId) && (varieties.length === 0 || Boolean(draft.subcategoryId)))
  const specsReady =
    Boolean(draft.size && draft.stage) && requiredExtra.every((item) => draft.traits[item.id])
  const detailsReady = Boolean(description.trim() && areaId && matched)

  const save = () => {
    const area = areaById(areaId)
    if (!matched || !area || !description.trim()) return
    if (isOther) {
      if (!matched || !area || !description.trim() || !draft.size || !draft.stage) return
      const id = addGreenhousePlant({
        title: matched.name,
        titleHe: matched.nameHe,
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
        traits: draft.traits,
        location: {
          region: area.region,
          regionHe: area.regionHe,
          lat: area.lat,
          lng: area.lng,
        },
        identification,
        identifyRequestIds: scans.map((scan) => scan.requestId),
      })
      if (id) setSavedId(id)
      else setSaveFailed(true)
      return
    }
    const category = catalog.categories.find((item) => item.id === draft.categoryId)
    const species = db.species.find((item) => item.id === category?.speciesId)
    const sub = catalog.subcategories.find((item) => item.id === draft.subcategoryId)
    if (!category || !species || !draft.size || !draft.stage) return
    const id = addGreenhousePlant({
      title: matched.name,
      titleHe: matched.nameHe,
      description: descriptionTouched ? description : matched.observed,
      descriptionHe: descriptionTouched ? description : matched.observedHe,
      photos,
      speciesId: species.id,
      variety: sub?.name ?? category.name,
      varietyHe: sub?.nameHe ?? category.nameHe,
      quality: draft.quality,
      sizeBand: draft.size,
      stage: draft.stage,
      code: matched.code,
      marketClassId: db.marketClasses.find((item) => item.code === matched.code)?.id,
      subcategoryId: draft.subcategoryId || undefined,
      traits:
        areaProperty && areaProperty.options.some((option) => option.id === areaId)
          ? { ...draft.traits, [AREA_PROPERTY_ID]: areaId }
          : draft.traits,
      location: {
        region: area.region,
        regionHe: area.regionHe,
        lat: area.lat,
        lng: area.lng,
      },
      identification,
      identifyRequestIds: scans.map((scan) => scan.requestId),
    })
    if (id) setSavedId(id)
    else setSaveFailed(true)
  }

  const reset = () => {
    setStep(0)
    setDirection(-1)
    setScans([])
    appliedLead.current = undefined
    setDraft(emptyClassDraft)
    setCategoryQuery('')
    setDescription('')
    setDescriptionTouched(false)
    setAreaId(defaultAreaId)
    setSavedId('')
    setSaveFailed(false)
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
          <IdentifyBadge identification={identification} />
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

  const body = (() => {
    switch (stepId) {
      case 'photo':
        return (
          <>
            <StepHead>
              <StepTitle>{t.addPlant.photoTitle}</StepTitle>
              <StepLead>
                {ADD_PLANT_UPLOAD_LIMIT > 1 ? t.addPlant.photoLead : t.addPlant.photoLeadOne}
              </StepLead>
            </StepHead>
          </>
        )
      case 'identity':
        return (
          <>
            <StepHead>
              <StepTitle>{t.addPlant.identityTitle}</StepTitle>
              <StepLead>{ai ? t.addPlant.identityLeadAi : t.addPlant.identityLeadManual}</StepLead>
            </StepHead>
            {isOther && missingCatalog ? (
              <Banner $tone="warn">
                <span>{t.addPlant.identityOther}</span>
              </Banner>
            ) : (
              banner
            )}
            {draft.categoryId ? (
              <IdentityCard key={identityPhoto || draft.categoryId}>
                <IdentityPhoto>
                  {identityPhoto ? <PlantImage src={identityPhoto} alt="" /> : null}
                </IdentityPhoto>
                <IdentityCopy>
                  <strong>
                    {isOther
                      ? t.addPlant.otherCategory
                      : selectedCategory
                        ? catalogName(selectedCategory, locale)
                        : ''}
                  </strong>
                  <span>
                    {selectedSub
                      ? catalogName(selectedSub, locale)
                      : varieties.length === 0 || isOther
                        ? t.addPlant.noSubcategory
                        : ''}
                  </span>
                </IdentityCopy>
              </IdentityCard>
            ) : null}
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
                layout="tiles"
                required
                value={draft.categoryId}
                suggestedId={aiDraft?.categoryId || (missingCatalog ? OTHER_CATEGORY_ID : undefined)}
                suggestedLabel={AI_MARK}
                options={[
                  ...categories.map((item) => ({
                    id: item.id,
                    label: catalogName(item, locale),
                    photo: item.id === draft.categoryId ? identityPhoto || item.photo : item.photo,
                  })),
                  ...(categoryQuery.trim() &&
                  !t.addPlant.otherCategory.toLowerCase().includes(categoryQuery.trim().toLowerCase())
                    ? []
                    : [
                        {
                          id: OTHER_CATEGORY_ID,
                          label: t.addPlant.otherCategory,
                          photo:
                            draft.categoryId === OTHER_CATEGORY_ID ? identityPhoto || undefined : photos[0] || undefined,
                        },
                      ]),
                ]}
                onChange={(value) =>
                  setClass({
                    categoryId: value,
                    subcategoryId: '',
                    quality: '',
                    size: '',
                    stage: '',
                    traits: {},
                  })
                }
              />
            </Section>
            {draft.categoryId ? (
              <Section key={draft.categoryId}>
                {varieties.length > 0 && !isOther ? (
                  <ChoiceChips
                    label={t.admin.subcategory}
                    layout="tiles"
                    required
                    value={draft.subcategoryId}
                    suggestedId={aiDraft?.categoryId === draft.categoryId ? aiDraft?.subcategoryId : undefined}
                    suggestedLabel={AI_MARK}
                    options={varieties.map((item) => ({
                      id: item.id,
                      label: catalogName(item, locale),
                      hint: item.code,
                      photo: item.photo || selectedCategory?.photo,
                    }))}
                    onChange={(value) =>
                      setClass({
                        subcategoryId: value,
                        quality: '',
                        size: '',
                        stage: '',
                      })
                    }
                  />
                ) : (
                  <ChoiceChips
                    label={t.admin.subcategory}
                    layout="tiles"
                    required
                    value={NO_SUBCATEGORY}
                    options={[
                      {
                        id: NO_SUBCATEGORY,
                        label: t.addPlant.noSubcategory,
                        photo: identityPhoto || undefined,
                      },
                    ]}
                    onChange={() => setClass({ subcategoryId: '' })}
                  />
                )}
              </Section>
            ) : null}
          </>
        )
      case 'specs':
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
                value={draft.size}
                suggestedId={aiDraft?.size || undefined}
                suggestedLabel={AI_MARK}
                options={sizes.map((size) => ({ id: size, label: size }))}
                onChange={(value) => setClass({ size: value as SizeBand | '', stage: '' })}
              />
            </Section>
            {draft.size ? (
              <Section key={`stage-${draft.size}`}>
                <ChoiceChips
                  label={t.admin.stage}
                  required
                  value={draft.stage}
                  suggestedId={aiDraft?.stage || undefined}
                  suggestedLabel={AI_MARK}
                  options={stages.map((stage) => ({
                    id: stage,
                    label: STAGE_LABEL[stage as StageBand]?.[locale] ?? stage,
                  }))}
                  onChange={(value) => setClass({ stage: value as StageBand | '' })}
                />
              </Section>
            ) : null}
            {draft.stage
              ? requiredExtra.map((property) => (
                  <Section key={property.id}>
                    <ChoiceChips
                      label={catalogName(property, locale)}
                      required
                      value={draft.traits[property.id] ?? ''}
                      suggestedId={aiDraft?.traits?.[property.id]}
                      suggestedLabel={AI_MARK}
                      options={property.options.map((option) => ({
                        id: option.id,
                        label: optionLabel(option, locale),
                      }))}
                      onChange={(value) =>
                        setClass({
                          traits: { ...draft.traits, [property.id]: value },
                        })
                      }
                    />
                  </Section>
                ))
              : null}
            {draft.stage && optionalProps.length > 0 ? (
              <More open={moreOpen} onToggle={(event) => setMoreOpen(event.currentTarget.open)}>
                <summary>
                  {t.greenhouse.moreProperties} <small>({optionalProps.length})</small>
                </summary>
                {optionalProps.map((property) => (
                  <ChoiceChips
                    key={property.id}
                    label={catalogName(property, locale)}
                    value={draft.traits[property.id] ?? ''}
                    suggestedId={aiDraft?.traits?.[property.id]}
                    suggestedLabel={AI_MARK}
                    options={property.options.map((option) => ({
                      id: option.id,
                      label: optionLabel(option, locale),
                    }))}
                    onChange={(value) =>
                      setClass({
                        traits: { ...draft.traits, [property.id]: value },
                      })
                    }
                  />
                ))}
              </More>
            ) : null}
          </>
        )
      case 'details':
        return (
          <>
            <StepHead>
              <StepTitle>{t.addPlant.detailsTitle}</StepTitle>
              <StepLead>{t.addPlant.detailsLead}</StepLead>
            </StepHead>
            {matched ? <ClassCode title={t.greenhouse.classWord}>{matched.code}</ClassCode> : null}
            <Field>
              {t.greenhouse.addDescription}
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
            <ChoiceChips
              label={t.greenhouse.addLocation}
              required
              value={areaId}
              options={AREAS.map((area) => ({
                id: area.id,
                label: locale === 'he' ? area.regionHe : area.region,
              }))}
              onChange={setAreaId}
            />
          </>
        )
      case 'review': {
        const category = catalog.categories.find((item) => item.id === draft.categoryId)
        const sub = catalog.subcategories.find((item) => item.id === draft.subcategoryId)
        const area = areaById(areaId)
        const rows: { label: string; value: string; step: StepId }[] = [
          {
            label: t.admin.category,
            value: isOther ? t.addPlant.otherCategory : category ? catalogName(category, locale) : '—',
            step: 'identity',
          },
          {
            label: t.admin.subcategory,
            value: sub
              ? catalogName(sub, locale)
              : varieties.length === 0 || isOther
                ? t.addPlant.noSubcategory
                : '—',
            step: 'identity',
          },
          { label: t.admin.size, value: draft.size, step: 'specs' },
          {
            label: t.admin.stage,
            value: draft.stage ? (STAGE_LABEL[draft.stage]?.[locale] ?? draft.stage) : '',
            step: 'specs',
          },
          {
            label: t.greenhouse.addLocation,
            value: area ? (locale === 'he' ? area.regionHe : area.region) : '',
            step: 'details',
          },
        ]
        const plantPhoto = photos[0] || ''
        const catalogPhoto = identityPhoto && identityPhoto !== plantPhoto ? identityPhoto : ''
        const hero = plantPhoto || identityPhoto
        return (
          <>
            <StepHead>
              <StepTitle>{t.addPlant.reviewTitle}</StepTitle>
              <StepLead>{t.addPlant.reviewLead}</StepLead>
            </StepHead>
            <Review>
              <ReviewPhoto>
                {hero ? <PlantImage src={hero} alt="" /> : null}
                {catalogPhoto ? (
                  <CategoryMark>
                    <PlantImage src={catalogPhoto} alt="" />
                  </CategoryMark>
                ) : null}
              </ReviewPhoto>
              <ReviewBody>
                <IdentifyBadge identification={identification} />
                {photos.length > 1 ? <PhotoChecks photos={photos} checks={identification.photos} size="sm" /> : null}
                <ReviewName>{matched ? (locale === 'he' ? matched.nameHe : matched.name) : ''}</ReviewName>
                {matched ? <ClassCode>{matched.code}</ClassCode> : null}
                <ReviewRows>
                  {rows.map((row) => (
                    <ReviewRow key={row.label}>
                      <dt>{row.label}</dt>
                      <dd>{row.value || '—'}</dd>
                      <EditLink type="button" onClick={() => go(STEPS.indexOf(row.step))}>
                        {t.addPlant.edit}
                      </EditLink>
                    </ReviewRow>
                  ))}
                </ReviewRows>
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
        if (ai || missingCatalog) return { label: t.addPlant.continue, disabled: false, hint: '' }
        if (scanning) return { label: t.addPlant.aiWorking, disabled: true, hint: '' }
        return {
          label: t.addPlant.fillManually,
          disabled: false,
          hint: scans.length > 0 ? t.addPlant.manualHint : t.addPlant.skipPhotoHint,
        }
      case 'identity':
        return {
          label: t.addPlant.next,
          disabled: !identityReady,
          hint: identityReady ? '' : t.addPlant.needIdentity,
        }
      case 'specs':
        return {
          label: t.addPlant.next,
          disabled: !specsReady,
          hint: specsReady ? '' : t.addPlant.needSpecs,
        }
      case 'details':
        return {
          label: t.addPlant.next,
          disabled: !detailsReady,
          hint: detailsReady ? '' : t.addPlant.needDetails,
        }
      case 'review':
        return {
          label: t.greenhouse.savePlant,
          disabled: !detailsReady || !specsReady || !identityReady,
          hint: saveFailed ? t.addPlant.saveFailed : '',
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
      />
      <StepBody key={stepId} $direction={direction}>
        {body}
      </StepBody>
      {/* Stays mounted so the scan result survives a trip to later steps and back. */}
      <div hidden={stepId !== 'photo'}>
        <PhotoIdentify
          scans={scans}
          onScansChange={setScans}
          checks={identification.photos}
          max={ADD_PLANT_UPLOAD_LIMIT}
        />
      </div>
      <Footer>
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
        <Button
          type="button"
          variant={stepId === 'review' ? 'growth' : stepId === 'photo' && !ai && !missingCatalog ? 'secondary' : 'primary'}
          disabled={next.disabled}
          onClick={() => (stepId === 'review' ? save() : go(step + 1))}
        >
          {next.label}
        </Button>
      </Footer>
    </Root>
  )
}
