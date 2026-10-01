import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../app/AppShell/AppShell.styles'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { Input, Select } from '../../components/Form/Form'
import { PlantImage } from '../../components/PlantImage/PlantImage'
import { SectionHeading } from '../../components/SectionHeading/SectionHeading'
import {
  ListingTypeCard,
  TypeRow,
} from '../../features/sell/components/ListingTypeCard/ListingTypeCard'
import { PhotoDropzone } from '../../features/sell/components/PhotoDropzone/PhotoDropzone'
import { GrowingNotes } from '../../components/GrowingNotes/GrowingNotes'
import { RarityChip } from '../../components/RarityChip/RarityChip'
import { publishBlocker } from '../../features/greenhouse/communityGrade'
import { useI18n } from '../../i18n/I18nProvider'
import { plantImages } from '../../mock/images'
import { factsForPlant, plantFacts } from '../../mock/plantFacts'
import {
  buildMarketCode,
  buildMarketDisplay,
  rootingToStage,
  varietyCode,
} from '../../mock/marketNaming'
import { AREAS, areaById, userPlace } from '../../mock/locations'
import { useStore } from '../../mock/store'
import type { QualityGrade, SizeBand } from '../../mock/types'
import {
  ActionBar,
  Blocker,
  BotanicalDetail,
  ClassCode,
  ClassTitle,
  CodeRow,
  Composer,
  ComposerCopy,
  ComposerStage,
  Confirm,
  ConfirmMark,
  ConfirmMeta,
  ConfirmName,
  ConfirmNote,
  ConfirmPhoto,
  ConfirmTitle,
  CurrencyMark,
  DetailsGrid,
  Eyebrow,
  FieldBox,
  FormActions,
  FormPanel,
  HeroPhoto,
  Identity,
  Intro,
  IntroText,
  IntroTitle,
  Layout,
  MetaLine,
  PriceBlock,
  PriceCaption,
  PriceHint,
  PriceWell,
  ProgressRow,
  Prompt,
  QuietGroup,
  QuietLabel,
  QuietRow,
  StepChip,
  Switch,
  UnitPill,
  UnitTrack,
} from './SellPage.styles'

export function SellPage({
  plantId: presetPlantId,
  onPublished,
}: {
  plantId?: string
  onPublished?: () => void
}) {
  const { db, currentUser, createPlantBatch, createListing } = useStore()
  const { t, locale, formatMoney } = useI18n()
  const navigate = useNavigate()
  const preset = presetPlantId ? db.plants.find((p) => p.id === presetPlantId) : undefined
  const presetPrice =
    db.marketClasses.find((m) => m.id === preset?.marketClassId)?.lastPrice ?? 10
  const [step, setStep] = useState(preset ? 2 : 0)
  const [speciesId, setSpeciesId] = useState(preset?.speciesId ?? 'sp-pothos')
  const [title, setTitle] = useState(preset?.title ?? 'Rooted cuttings batch')
  const [titleHe, setTitleHe] = useState(preset?.titleHe ?? 'מנת ייחורים מושרשים')
  const [qty, setQty] = useState(preset?.quantity ?? 25)
  const [quality, setQuality] = useState<QualityGrade>(preset?.quality || 'B')
  const [rooting, setRooting] = useState<'rooted' | 'unrooted' | 'established'>(
    preset?.rooting ?? 'rooted',
  )
  const [parentId, setParentId] = useState(preset?.parentId ?? '')
  const [photoMock, setPhotoMock] = useState(Boolean(preset?.photos[0]))
  const [plantId, setPlantId] = useState(preset?.id ?? '')
  const [price, setPrice] = useState(preset ? presetPrice : 10)
  const [unit, setUnit] = useState<'plant' | 'cutting' | 'bundle'>('cutting')
  const [offers, setOffers] = useState(true)
  const [published, setPublished] = useState(false)
  const [variety, setVariety] = useState(preset?.variety ?? 'Golden')
  const [sizeBand, setSizeBand] = useState<SizeBand>(preset?.sizeBand ?? 'M')
  const home = userPlace(currentUser)
  const [areaId, setAreaId] = useState(
    AREAS.find((area) => area.region === home?.region)?.id ?? '',
  )

  if (!currentUser || currentUser.role === 'guest') {
    return (
      <div>
        <PageHeader>
          <h1>{t.sell.title}</h1>
        </PageHeader>
        <Card>
          <p>{t.common.guestBlocked}</p>
        </Card>
      </div>
    )
  }

  const parents = db.plants.filter((p) => p.ownerId === currentUser.id)
  const species = db.species.find((s) => s.id === speciesId)
  const stage = rootingToStage(rooting, sizeBand === 'XL' ? 'mature' : undefined)
  const matchedClass = db.marketClasses.find(
    (mc) =>
      mc.speciesId === speciesId &&
      mc.quality === quality &&
      mc.size === sizeBand &&
      mc.stage === stage,
  )
  const classCode =
    matchedClass?.code ??
    buildMarketCode({
      ticker: species?.ticker ?? 'PLT',
      varietyCode: varietyCode(variety),
      quality,
      size: sizeBand,
      stage,
    })
  const classDisplay = matchedClass
    ? locale === 'he'
      ? matchedClass.displayNameHe
      : matchedClass.displayName
    : buildMarketDisplay({
        species: locale === 'he' ? species?.commonNameHe ?? '' : species?.commonName ?? '',
        variety,
        quality,
        size: sizeBand,
        stage,
        locale,
      })

  const listingTypes = [
    { id: 'plant' as const, title: t.sell.typePlant, hint: t.sell.typePlantHint },
    { id: 'cutting' as const, title: t.sell.typeCutting, hint: t.sell.typeCuttingHint },
    { id: 'bundle' as const, title: t.sell.typeBundle, hint: t.sell.typeBundleHint },
  ]

  const steps = [t.sell.stepPlant, t.sell.stepDetails, t.sell.stepList]
  const unitOptions = [
    { id: 'cutting' as const, label: t.market.unitCutting },
    { id: 'plant' as const, label: t.market.unitPlant },
    { id: 'bundle' as const, label: t.market.bundle },
  ]
  const unitLabel = unitOptions.find((option) => option.id === unit)?.label ?? unit
  const heroPhoto = preset?.photos[0] ?? (photoMock ? plantImages.cuttings : undefined)
  const rangeLabel = matchedClass
    ? `${formatMoney(matchedClass.rangeMin)}–${formatMoney(matchedClass.rangeMax)}`
    : `${formatMoney(Math.round(price * 0.85))}–${formatMoney(Math.round(price * 1.15))}`

  const createBatch = (e: FormEvent) => {
    e.preventDefault()
    const area = areaById(areaId)
    if (!area) return
    const id = createPlantBatch({
      speciesId,
      title,
      titleHe,
      quantity: qty,
      quality,
      rooting,
      parentId: parentId || undefined,
      photo: photoMock ? plantImages.cuttings : undefined,
      location: { region: area.region, regionHe: area.regionHe, lat: area.lat, lng: area.lng },
    })
    if (!id) return
    setPlantId(id)
    setStep(2)
  }

  const target = db.plants.find((p) => p.id === plantId)
  const facts = target ? factsForPlant(target, db.species) : plantFacts(undefined, species)
  const blocker = target ? publishBlocker(target, db.flags.publishRequirement) : null
  const blockerText =
    blocker === 'verified' ? t.sell.needsVerified : blocker === 'graded' ? t.sell.needsGraded : ''

  const publish = (e: FormEvent) => {
    e.preventDefault()
    if (!plantId || !(price > 0) || blocker) return
    const result = createListing({ plantId, price, quantity: qty, unit, allowOffers: offers })
    if (result.ok) setPublished(true)
  }

  const finish = () => {
    if (onPublished) onPublished()
    else navigate(`/plants/${plantId}`)
  }

  return (
    <Layout $composer={step === 2}>
      {step < 2 && (
        <Intro>
          <Eyebrow>{t.sell.eyebrow}</Eyebrow>
          <IntroTitle id="sell-dialog-title">{t.sell.title}</IntroTitle>
          <IntroText>{t.sell.intro}</IntroText>
          <BotanicalDetail>
            <PlantImage src={plantImages.cuttings} alt="" />
          </BotanicalDetail>
        </Intro>
      )}

      <FormPanel>
        {!published && (
          <ProgressRow>
            {steps.map((label, i) => (
              <StepChip key={label} $on={step === i} $done={i < step}>
                {label}
              </StepChip>
            ))}
          </ProgressRow>
        )}

        {step === 0 && (
          <>
            <Prompt>{t.sell.prompt}</Prompt>
            <TypeRow>
              {listingTypes.map((lt) => (
                <ListingTypeCard
                  key={lt.id}
                  title={lt.title}
                  description={lt.hint}
                  selected={unit === lt.id}
                  onSelect={() => setUnit(lt.id)}
                />
              ))}
            </TypeRow>
            <DetailsGrid>
              <FieldBox>
                <span>{t.sell.species}</span>
                <Select value={speciesId} onChange={(e) => setSpeciesId(e.target.value)}>
                  {db.species.map((s) => (
                    <option key={s.id} value={s.id}>
                      {locale === 'he' ? s.commonNameHe : s.commonName}
                    </option>
                  ))}
                </Select>
              </FieldBox>
              <FieldBox>
                <span>{t.sell.parent}</span>
                <Select value={parentId} onChange={(e) => setParentId(e.target.value)}>
                  <option value="">—</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {locale === 'he' ? p.titleHe : p.title}
                    </option>
                  ))}
                </Select>
              </FieldBox>
            </DetailsGrid>
            <FormActions>
              <span />
              <Button type="button" onClick={() => setStep(1)}>
                {t.common.continue}
              </Button>
            </FormActions>
          </>
        )}

        {step === 1 && (
          <form onSubmit={createBatch}>
            <FormPanel>
              <SectionHeading eyebrow={t.sell.detailsEyebrow} title={t.sell.stepDetails} />
              <PhotoDropzone
                label={photoMock ? t.sell.photoMock : t.sell.photoLabel}
                hint={t.sell.photoHint}
                previewSrc={photoMock ? plantImages.cuttings : undefined}
                onSelect={() => setPhotoMock(true)}
              />
              <DetailsGrid>
                <FieldBox>
                  <span>{t.sell.titleLabel} (EN)</span>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </FieldBox>
                <FieldBox>
                  <span>{t.sell.titleLabel} (HE)</span>
                  <Input value={titleHe} onChange={(e) => setTitleHe(e.target.value)} />
                </FieldBox>
                <FieldBox>
                  <span>{t.sell.qty}</span>
                  <Input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                  />
                </FieldBox>
                <FieldBox>
                  <span>{t.sell.quality}</span>
                  <Select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as QualityGrade)}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </Select>
                </FieldBox>
                <FieldBox>
                  <span>{t.sell.size}</span>
                  <Select
                    value={sizeBand}
                    onChange={(e) => setSizeBand(e.target.value as SizeBand)}
                  >
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                  </Select>
                </FieldBox>
                <FieldBox>
                  <span>{t.sell.variety}</span>
                  <Input value={variety} onChange={(e) => setVariety(e.target.value)} />
                </FieldBox>
                <FieldBox>
                  <span>{t.sell.location}</span>
                  <Select
                    value={areaId}
                    required
                    aria-label={t.sell.location}
                    onChange={(e) => setAreaId(e.target.value)}
                  >
                    <option value="">{t.greenhouse.locationPlaceholder}</option>
                    {AREAS.map((area) => (
                      <option key={area.id} value={area.id}>
                        {locale === 'he' ? area.regionHe : area.region}
                      </option>
                    ))}
                  </Select>
                </FieldBox>
                <FieldBox>
                  <span>{t.sell.rooting}</span>
                  <Select
                    value={rooting}
                    onChange={(e) => setRooting(e.target.value as typeof rooting)}
                  >
                    <option value="rooted">{t.market.rooted}</option>
                    <option value="unrooted">{t.market.unrooted}</option>
                    <option value="established">established</option>
                  </Select>
                </FieldBox>
              </DetailsGrid>
              <FormActions>
                <Button type="button" variant="secondary" onClick={() => setStep(0)}>
                  {t.common.back}
                </Button>
                <Button type="submit" disabled={!areaId}>
                  {t.sell.create}
                </Button>
              </FormActions>
            </FormPanel>
          </form>
        )}

        {step === 2 && published && (
          <Confirm>
            <ConfirmPhoto>
              <PlantImage src={heroPhoto} alt="" />
            </ConfirmPhoto>
            <ConfirmMark aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 22 22">
                <path
                  d="M5 11.5 9 15.5 17 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </ConfirmMark>
            <ConfirmTitle id="sell-dialog-title">{t.sell.done}</ConfirmTitle>
            <ConfirmName>{classDisplay}</ConfirmName>
            <ConfirmMeta>
              {formatMoney(price)} · {unitLabel}
            </ConfirmMeta>
            <ConfirmNote>{t.sell.publishedNote}</ConfirmNote>
            <Button type="button" onClick={finish}>
              {t.sell.finish}
            </Button>
          </Confirm>
        )}

        {step === 2 && !published && (
          <Composer onSubmit={publish}>
            <ComposerStage>
              <HeroPhoto>
                <PlantImage src={heroPhoto} alt="" />
              </HeroPhoto>
              <ComposerCopy>
                <Identity>
                  <Eyebrow>{t.exchange.classifiedAs}</Eyebrow>
                  <ClassTitle id="sell-dialog-title">{classDisplay}</ClassTitle>
                  <CodeRow>
                    <ClassCode>{classCode}</ClassCode>
                    <RarityChip rarity={facts.rarity} />
                  </CodeRow>
                  {matchedClass && (
                    <MetaLine>
                      {matchedClass.supplyUnits} / {matchedClass.demandUnits}{' '}
                      {t.exchange.availableWanted}
                    </MetaLine>
                  )}
                </Identity>
                <PriceBlock>
                  <PriceCaption>{t.sell.setPrice}</PriceCaption>
                  <PriceWell>
                    <CurrencyMark>{t.common.ils}</CurrencyMark>
                    <input
                      type="number"
                      min={0}
                      step="0.1"
                      inputMode="decimal"
                      aria-label={t.sell.price}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                    />
                  </PriceWell>
                  <PriceHint>
                    {t.exchange.currentRange} {rangeLabel}
                  </PriceHint>
                </PriceBlock>
                <QuietRow>
                  <QuietGroup>
                    <QuietLabel>{t.sell.unit}</QuietLabel>
                    <UnitTrack role="group" aria-label={t.sell.unit}>
                      {unitOptions.map((option) => (
                        <UnitPill
                          key={option.id}
                          type="button"
                          $on={unit === option.id}
                          aria-pressed={unit === option.id}
                          onClick={() => setUnit(option.id)}
                        >
                          {option.label}
                        </UnitPill>
                      ))}
                    </UnitTrack>
                  </QuietGroup>
                  <QuietGroup>
                    <QuietLabel id="sell-allow-offers">{t.sell.offers}</QuietLabel>
                    <Switch
                      type="button"
                      role="switch"
                      aria-checked={offers}
                      aria-labelledby="sell-allow-offers"
                      $on={offers}
                      onClick={() => setOffers((value) => !value)}
                    />
                  </QuietGroup>
                </QuietRow>
                <GrowingNotes growthTime={facts.growthTime} conditions={facts.conditions} />
                {blockerText && <Blocker role="alert">{blockerText}</Blocker>}
                <ActionBar>
                  {!preset && (
                    <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                      {t.common.back}
                    </Button>
                  )}
                  <Button type="submit" disabled={!(price > 0) || Boolean(blocker)}>
                    {t.sell.publish}
                  </Button>
                </ActionBar>
              </ComposerCopy>
            </ComposerStage>
          </Composer>
        )}
      </FormPanel>
    </Layout>
  )
}
