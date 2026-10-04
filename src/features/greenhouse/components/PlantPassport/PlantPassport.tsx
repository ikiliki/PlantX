import { OTHER_CATEGORY_ID } from '../../plantClass'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { UNKNOWN_AREA } from '../../../../mock/locations'
import { Avatar } from '../../../../components/Avatar/Avatar'
import { Button } from '../../../../components/Button/Button'
import { FeatureGate } from '../../../../components/FeatureGate/FeatureGate'
import { HealthChip } from '../../../../components/HealthChip/HealthChip'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useAuth } from '../../../auth/AuthProvider'
import {
  CORE_PROPERTY_IDS,
  catalogName,
  categoryBySpeciesId,
  optionLabel,
  plantPropertyValue,
  propertyRelevant,
  subcategoryOfPlant,
} from '../../../catalog/catalog'
import { speciesHref } from '../../../species/components/GuideLink/GuideLink'
import { useI18n } from '../../../../i18n/I18nProvider'
import { publicGrowerName } from '../../../profile/avatarIcons'
import { useStore } from '../../../../mock/store'
import { LevelBadge } from '../LevelBadge/LevelBadge'
import { greenhouseHref } from '../GreenhouseCard/GreenhouseCard'
import { useGreenhouseLevels } from '../../useGreenhouseLevels'
import { isPlacementEnabled } from '../../../../theme/release'
import type { StageBand, TodoSubcategory } from '../../../../mock/types'
import { TodoKindIcon } from '../../../todo/components/TodoKindIcon/TodoKindIcon'
import { aggregateCommunityGrade, formatGradeWhen } from '../../communityGrade'
import { PlantCatalogMark } from '../CatalogMark/CatalogMark'
import { IdentifyBadge } from '../IdentifyBadge/IdentifyBadge'
import { PassportMarket } from '../PassportMarket/PassportMarket'
import { PassportTodo } from '../../../todo/components/PassportTodo/PassportTodo'
import { PhotoChecks } from '../PhotoChecks/PhotoChecks'
import { PhotoCheckSticker } from '../PhotoCheckSticker/PhotoCheckSticker'
import { PlantPhotoGallery } from '../PlantPhotoGallery/PlantPhotoGallery'
import {
  ActionRow,
  ActivityBody,
  AiStamp,
  Aside,
  GreenhouseLabel,
  GreenhouseLink,
  OwnerLabel,
  AsideStat,
  AsideStats,
  Board,
  Frame,
  Code,
  AsideStatButton,
  GradeRow,
  IdentityHead,
  Main,
  Missing,
  Muted,
  NameBlock,
  OwnerLink,
  OwnerMeta,
  OwnerName,
  Panel,
  PhotoIcon,
  PhotoIconButton,
  PhotoMore,
  CareMarkSlot,
  PriceTip,
  Qty,
  Rating,
  SectionTitle,
  ShowMore,
  CategoryName,
  SubName,
  Tab,
  TaxonomyRow,
  TaxonomySep,
  TabBar,
  TipLine,
  Timeline,
  TimelineRow,
  Title,
  Toast,
  SetPlace,
} from './PlantPassport.styles'

type TabId = 'grading' | 'todo' | 'activity' | 'market'

/** Drop trailing ×N (or xN) quantity suffixes baked into listing titles. */
function titleWithoutQuantity(text: string) {
  return text.replace(/\s*[×x]\s*[\d,.]+$/iu, '').trim()
}

function stageName(stage: StageBand | undefined, labels: { mature: string; established: string; rooted: string; cutting: string }) {
  if (stage === 'MATURE') return labels.mature
  if (stage === 'EST') return labels.established
  if (stage === 'ROOTED') return labels.rooted
  if (stage === 'CUT') return labels.cutting
  return undefined
}

type StampFieldId = 'category' | 'subcategory' | 'size' | 'stage'

/** Human label for an AI-suggested value, so a changed field can name what the AI had answered. */
function aiFieldLabel(
  fieldId: StampFieldId,
  aiValue: string | undefined,
  catalog: ReturnType<typeof useStore>['db']['catalog'],
  locale: Parameters<typeof catalogName>[1],
  stageLabels: { mature: string; established: string; rooted: string; cutting: string },
): string | undefined {
  if (!aiValue) return undefined
  if (fieldId === 'size') return aiValue
  if (fieldId === 'stage') return stageName(aiValue as StageBand, stageLabels) ?? aiValue
  if (fieldId === 'subcategory') {
    const sub = catalog.subcategories.find((item) => item.id === aiValue)
    return sub ? catalogName(sub, locale) : aiValue
  }
  const category = catalog.categories.find((item) => item.id === aiValue)
  return category ? catalogName(category, locale) : aiValue
}

/** Blue ✦ when the AI value was kept; muted ✎ when the owner changed it (tooltip then shows the AI value). */
function FieldStamp({
  mark,
  aiLabel,
  corner,
}: {
  mark: { check: 'kept' | 'changed' | 'manual'; aiValue?: string }
  aiLabel?: string
  corner?: boolean
}) {
  const { t } = useI18n()
  if (mark.check === 'manual') return null
  const changed = mark.check === 'changed'
  const tip = changed
    ? aiLabel
      ? t.passport.aiWas.replace('{value}', aiLabel)
      : t.passport.aiChanged
    : t.passport.aiFilled
  return (
    <AiStamp $changed={changed} $corner={corner} title={tip} aria-label={tip}>
      {changed ? '✎' : '✦'}
    </AiStamp>
  )
}

export function PlantPassport({
  plantId,
  embedded = false,
  dialog = false,
  initialTab = 'grading',
  activityKey,
  careMark,
}: {
  plantId: string
  embedded?: boolean
  /** Fixed popup: photo stays put, the white page scrolls. */
  dialog?: boolean
  initialTab?: TabId
  /** History row to mark when the activity tab is open. */
  activityKey?: string
  /** Care assignment stamp after watering / photo. */
  careMark?: TodoSubcategory
}) {
  const { db, currentUser, signedIn, reserveListing } = useStore()
  const { openAuth } = useAuth()
  const { t, tr, formatMoney, locale } = useI18n()
  const plant = db.plants.find((item) => item.id === plantId)
  const [tab, setTab] = useState<TabId>(initialTab)
  // Extra fields show in full on the wide layout; they fold behind Show more only when they would crowd the owner rows.
  const [customsOpen, setCustomsOpen] = useState(false)
  const [probe, setProbe] = useState(true)
  const [crowded, setCrowded] = useState(false)
  const asideRef = useRef<HTMLElement>(null)
  const listing = db.listings.find((item) => item.plantId === plantId && item.status === 'active')
  const [toast, setToast] = useState('')
  const [photoIndex, setPhotoIndex] = useState(0)
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false)
  const levels = useGreenhouseLevels()
  const { pathname } = useLocation()
  // As a popup, the owner and greenhouse rows only make sense from Home and the market; elsewhere the grower is already known.
  const showOwner = !dialog || pathname === '/home' || pathname.startsWith('/market')

  const hasLevel = Boolean(levels[db.plants.find((item) => item.id === plantId)?.ownerId ?? ''])
  // Measure again whenever the plant or the board size changes: show every field, then fold if they overflow.
  useEffect(() => {
    setCrowded(false)
    setProbe(true)
  }, [plantId, showOwner, hasLevel])

  useEffect(() => {
    const board = asideRef.current?.parentElement
    if (!board) return
    let size = `${board.clientWidth}x${board.clientHeight}`
    const observer = new ResizeObserver(() => {
      const next = `${board.clientWidth}x${board.clientHeight}`
      if (next === size) return
      size = next
      setCrowded(false)
      setProbe(true)
    })
    observer.observe(board)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    if (!probe) return
    const aside = asideRef.current
    if (!aside) return
    const stacked = (aside.parentElement?.clientWidth ?? 0) <= 760
    setCrowded(stacked || aside.scrollHeight > aside.clientHeight + 1)
    setProbe(false)
  }, [probe])

  useEffect(() => {
    setPhotoIndex(0)
    setPhotoViewerOpen(false)
    setCustomsOpen(false)
    setTab(initialTab)
  }, [plantId, initialTab])

  useEffect(() => {
    if (tab !== 'activity' || !activityKey) return
    document.getElementById(`passport-activity-${activityKey}`)?.scrollIntoView({ block: 'nearest' })
  }, [tab, activityKey, plantId])

  if (!plant) {
    return (
      <Frame>
        <Board $embedded={embedded} $dialog={dialog}>
          <Missing id="plant-passport-title">{t.passport.notFound}</Missing>
        </Board>
      </Frame>
    )
  }

  const species = db.species.find((item) => item.id === plant.speciesId)
  const owner = db.users.find((item) => item.id === plant.ownerId)
  const marketClass = db.marketClasses.find((item) => item.id === plant.marketClassId)
  const ownerId = signedIn && currentUser ? currentUser.id : db.visitorId
  const isOwner = plant.ownerId === ownerId
  const showBuy = Boolean(listing) && !isOwner
  const stage = stageName(plant.stage, {
    mature: t.market.mature,
    established: t.market.established,
    rooted: t.market.rooted,
    cutting: t.market.unitCutting,
  })
  const stageLabels = {
    mature: t.market.mature,
    established: t.market.established,
    rooted: t.market.rooted,
    cutting: t.market.unitCutting,
  }
  const traits: { label: string; value: ReactNode; fieldId?: 'size' | 'stage' }[] = [
    { label: t.market.size, value: plant.sizeBand ?? plant.sizeGrade, fieldId: 'size' },
    ...(stage ? [{ label: t.market.stage, value: stage, fieldId: 'stage' as const }] : []),
    {
      label: t.sell.location,
      // Unknown on the owner's own plant: say where to set it instead of leaving a dead end.
      value:
        isOwner && plant.locationZone === UNKNOWN_AREA.region ? (
          <SetPlace to="/settings">{t.passport.setPlace}</SetPlace>
        ) : (
          tr(plant.locationZone, plant.locationZoneHe)
        ),
    },
  ]
  const catalogCategory = categoryBySpeciesId(db.catalog, plant.speciesId)
  const catalogSub = subcategoryOfPlant(db.catalog, plant)
  const categoryLabel = catalogCategory ? catalogName(catalogCategory, locale) : ''
  const subLabel = catalogSub
    ? catalogName(catalogSub, locale)
    : plant.variety
      ? tr(plant.variety, plant.varietyHe ?? plant.variety)
      : ''

  const categoryMark = plant.identification?.fields?.category
  const subMark = plant.identification?.fields?.subcategory

  const communityGrade = aggregateCommunityGrade(plant.grades)
  const gradeLabel = communityGrade ? t.grade.community : t.grade.catalog
  const gradeLetter = communityGrade ?? plant.quality
  const grades = [...(plant.grades ?? [])].sort((a, b) => b.at.localeCompare(a.at))

  const customFields = catalogCategory
    ? db.catalog.properties.flatMap((property) => {
        if ((CORE_PROPERTY_IDS as readonly string[]).includes(property.id)) return []
        if (property.categoryIds.length === 0 && property.subcategoryIds.length === 0) return []
        if (!propertyRelevant(db.catalog, property, catalogCategory.id, catalogSub?.id ?? '')) return []
        const raw = plantPropertyValue(plant, property.id)
        const option = raw ? property.options.find((item) => item.id === raw) : undefined
        return [
          {
            id: property.id,
            label: catalogName(property, locale),
            value: option ? optionLabel(option, locale) : raw || '—',
          },
        ]
      })
    : []

  const marketOn = isPlacementEnabled(db.system, 'passport.market')
  const rankOn = isPlacementEnabled(db.system, 'passport.rank')
  const todoOn = isPlacementEnabled(db.system, 'passport.todo')
  const tabs: { id: TabId; label: string }[] = [
    ...(rankOn ? [{ id: 'grading' as const, label: t.passport.gradingTab }] : []),
    ...(todoOn ? [{ id: 'todo' as const, label: t.passport.todoTab }] : []),
    { id: 'activity', label: t.passport.activityTab },
    ...(marketOn ? [{ id: 'market' as const, label: t.passport.marketTab }] : []),
  ]
  const fallbackTab: TabId = rankOn ? 'grading' : todoOn ? 'todo' : 'activity'
  const activeTab: TabId =
    (tab === 'market' && !marketOn) ||
    (tab === 'grading' && !rankOn) ||
    (tab === 'todo' && !todoOn)
      ? fallbackTab
      : tab

  const onBuy = () => {
    if (!listing) return
    const run = () => {
      const orderId = reserveListing(listing.id)
      setToast(`${t.market.intentRecorded} (${orderId})`)
    }
    if (!signedIn) openAuth('buy', run)
    else run()
  }

  const plantListingIds = new Set(
    db.listings.filter((item) => item.plantId === plant.id).map((item) => item.id),
  )
  const openOffers = db.offers
    .filter((offer) => offer.status === 'open' && plantListingIds.has(offer.listingId))
    .map((offer) => offer.amount)
  const bestOffer = openOffers.length > 0 ? Math.max(...openOffers) : undefined
  const lastSale = plant.comps?.[plant.comps.length - 1]?.price ?? marketClass?.lastPrice
  const floor = marketClass?.rangeMin
  const quotes = [
    { label: t.passport.bestOffer, value: bestOffer },
    { label: t.passport.lastSale, value: lastSale },
    { label: t.passport.floor, value: floor },
  ]
  const known = quotes.flatMap((quote) => (quote.value == null ? [] : [quote.value]))
  const average = known.length > 0 ? Math.round(known.reduce((sum, value) => sum + value, 0) / known.length) : null

  const photos = plant.photos.filter(Boolean)
  const safeIndex = photos.length === 0 ? 0 : Math.min(photoIndex, photos.length - 1)
  const ownerName = owner ? publicGrowerName(owner, locale === 'he') : ''

  const title = titleWithoutQuantity(tr(plant.title, plant.titleHe))

  return (
    <Frame>
    <Board $embedded={embedded} $dialog={dialog}>
      <PlantPhotoGallery
        photos={photos}
        checks={plant.identification?.photos}
        alt={title}
        embedded={embedded}
        dialog={dialog}
        index={safeIndex}
        onIndexChange={setPhotoIndex}
        viewerOpen={photoViewerOpen}
        onViewerOpenChange={setPhotoViewerOpen}
      />

      <Aside ref={asideRef} $embedded={embedded} $dialog={dialog}>
        <IdentityHead>
          <PhotoIconButton
            type="button"
            aria-label={t.passport.photos}
            onClick={() => {
              setPhotoIndex(0)
              setPhotoViewerOpen(true)
            }}
          >
            <PhotoIcon>
              <PlantImage src={photos[0]} alt="" />
              {careMark ? (
                <CareMarkSlot>
                  <TodoKindIcon kind={careMark} size={16} mark />
                </CareMarkSlot>
              ) : null}
            </PhotoIcon>
            {photos.length > 1 ? (
              <PhotoMore title={t.addPlant.photosCount.replace('{n}', String(photos.length))}>
                +{photos.length - 1}
              </PhotoMore>
            ) : null}
          </PhotoIconButton>
          <NameBlock>
            <Code>{plant.code}</Code>
            <Title id="plant-passport-title" as={embedded ? 'h2' : 'h1'}>
              {title}
            </Title>
            {(categoryLabel || subLabel) && (
              <TaxonomyRow>
                <PlantCatalogMark plant={plant} size={24} />
                {categoryLabel &&
                  (species ? (
                    <CategoryName as={Link} to={speciesHref(species.id)}>
                      {categoryLabel}
                    </CategoryName>
                  ) : (
                    <CategoryName>{categoryLabel}</CategoryName>
                  ))}
                {categoryLabel && categoryMark ? (
                  <FieldStamp
                    mark={categoryMark}
                    aiLabel={
                      categoryMark.check === 'changed'
                        ? aiFieldLabel('category', categoryMark.aiValue, db.catalog, locale, stageLabels)
                        : undefined
                    }
                  />
                ) : null}
                {categoryLabel && subLabel && <TaxonomySep aria-hidden>·</TaxonomySep>}
                {subLabel && <SubName>{subLabel}</SubName>}
                {subLabel && subMark ? (
                  <FieldStamp
                    mark={subMark}
                    aiLabel={
                      subMark.check === 'changed'
                        ? aiFieldLabel('subcategory', subMark.aiValue, db.catalog, locale, stageLabels)
                        : undefined
                    }
                  />
                ) : null}
              </TaxonomyRow>
            )}
          </NameBlock>
        </IdentityHead>

          {showBuy && !embedded && (
            <ActionRow>
              {listing?.allowOffers && marketOn && (
                <Button variant="secondary" type="button" onClick={() => setTab('market')}>
                  {t.market.offer}
                </Button>
              )}
              <Button variant="growth" type="button" onClick={onBuy}>
                {t.market.buy}
              </Button>
            </ActionRow>
          )}
          {toast && activeTab !== 'market' && <Toast role="status">{toast}</Toast>}

        <AsideStats>
          {gradeLetter ? (
            <AsideStat title={gradeLabel} data-grade-source={communityGrade ? 'community' : 'catalog'}>
              <dt>{gradeLabel}</dt>
              <dd>{gradeLetter}</dd>
            </AsideStat>
          ) : null}
          {!marketOn ? null : average == null ? (
            <AsideStat>
              <dt>{t.passport.averagePrice}</dt>
              <dd>—</dd>
            </AsideStat>
          ) : (
            <AsideStatButton type="button" aria-describedby="passport-price-tip" data-passport-average>
              <dt>{t.passport.averagePrice}</dt>
              <dd>{formatMoney(average)}</dd>
              <PriceTip id="passport-price-tip" role="tooltip">
                {quotes.map((quote) => (
                  <TipLine key={quote.label}>
                    <span>{quote.label}</span>
                    <strong>{quote.value == null ? '—' : formatMoney(quote.value)}</strong>
                  </TipLine>
                ))}
              </PriceTip>
            </AsideStatButton>
          )}
          {traits.map((trait) => {
            const mark = trait.fieldId ? plant.identification?.fields?.[trait.fieldId] : undefined
            const aiLabel =
              mark?.check === 'changed' && trait.fieldId
                ? aiFieldLabel(trait.fieldId, mark.aiValue, db.catalog, locale, stageLabels)
                : undefined
            return (
              <AsideStat key={trait.label}>
                <dt>{trait.label}</dt>
                <dd>{trait.value}</dd>
                {mark ? <FieldStamp mark={mark} aiLabel={aiLabel} corner /> : null}
              </AsideStat>
            )
          })}
          <AsideStat>
            <dt>{t.market.quantity}</dt>
            <dd>×{plant.quantity}</dd>
          </AsideStat>
          {(customsOpen || !crowded) &&
            customFields.map((field) => (
              <AsideStat key={field.id}>
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </AsideStat>
            ))}
        </AsideStats>
        {customFields.length > 0 && crowded && (
          <ShowMore type="button" onClick={() => setCustomsOpen((open) => !open)}>
            {customsOpen ? t.passport.showLess : t.passport.showMore}
          </ShowMore>
        )}

        {owner && showOwner && (
          <>
            <OwnerLabel>{t.passport.owner}</OwnerLabel>
            <OwnerLink to={`/sellers/${owner.id}`} aria-label={`${t.passport.owner}: ${ownerName}`}>
              <Avatar name={ownerName} color={owner.avatarColor} icon={owner.avatarIcon} size={38} />
              <OwnerMeta>
                <OwnerName>{ownerName}</OwnerName>
                <Rating>★ {owner.rating}</Rating>
              </OwnerMeta>
            </OwnerLink>
            {levels[owner.id] ? (
              <GreenhouseLabel>{t.nav.greenhouse}</GreenhouseLabel>
            ) : null}
            {levels[owner.id] ? (
              <GreenhouseLink to={greenhouseHref(owner.id)} aria-label={`${t.greenhouse.levelLabel}: ${ownerName}`}>
                <LevelBadge
                  level={levels[owner.id].level}
                  progress={levels[owner.id].progress}
                  owner={{ name: ownerName, color: owner.avatarColor, icon: owner.avatarIcon }}
                  size="sm"
                />
                <OwnerMeta>
                  <OwnerName>
                    {t.greenhouse.levelN.replace('{n}', String(levels[owner.id].level))} ·{' '}
                    {t.greenhouse[`levelRank${levels[owner.id].rank}` as keyof typeof t.greenhouse] as string}
                  </OwnerName>
                  <Rating>
                    {t.greenhouse.levelXp.replace('{xp}', String(levels[owner.id].xp))} ·{' '}
                    {levels[owner.id].plants === 1
                      ? t.greenhouse.levelPlantsOne
                      : t.greenhouse.levelPlants.replace('{n}', String(levels[owner.id].plants))}
                  </Rating>
                </OwnerMeta>
              </GreenhouseLink>
            ) : null}
          </>
        )}
      </Aside>

      <Main $embedded={embedded} $dialog={dialog}>
        <TabBar role="tablist" aria-label={t.passport.title}>
          {tabs.map((item) => (
            <Tab
              key={item.id}
              type="button"
              role="tab"
              aria-selected={activeTab === item.id}
              $on={activeTab === item.id}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </Tab>
          ))}
        </TabBar>

        <Panel role="tabpanel" $embedded={embedded} $dialog={dialog}>
          {activeTab === 'grading' && rankOn && (
            <FeatureGate placement="passport.rank" title={t.passport.gradingTab}>
              <SectionTitle>{t.passport.gradingTab}</SectionTitle>
              {grades.length === 0 ? (
                <Muted>{t.grade.noActivity}</Muted>
              ) : (
                <Timeline data-grade-activity>
                  {grades.map((grade, index) => (
                    <TimelineRow key={`${grade.at}-${index}`}>
                      <time dateTime={grade.at}>{formatGradeWhen(grade.at, locale)}</time>
                      <GradeRow>
                        <HealthChip health={grade.letter} />
                        <span>{t.grade.anonymousEntry}</span>
                      </GradeRow>
                    </TimelineRow>
                  ))}
                </Timeline>
              )}
            </FeatureGate>
          )}

          {activeTab === 'todo' && todoOn && (
            <FeatureGate placement="passport.todo" title={t.passport.todoTab}>
              <PassportTodo
                plant={plant}
                todos={(db.todos ?? []).filter((todo) => todo.plantId === plant.id)}
                careMark={careMark}
              />
            </FeatureGate>
          )}

          {activeTab === 'activity' && (
            <>
              <SectionTitle>{t.passport.history}</SectionTitle>
              {(() => {
                const fromActivity = (db.updates ?? [])
                  .filter((item) => item.plantId === plant.id)
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                if (fromActivity.length) {
                  return (
                    <Timeline>
                      {fromActivity.map((item) => {
                        const key = item.id
                        const marked = key === activityKey
                        const at = item.createdAt.slice(0, 10)
                        const checks = plant.identification?.photos
                        const scanCheck =
                          item.kind === 'scan' ? checks?.find((check) => check.requestId === item.identifyRequestId) : undefined
                        return (
                          <TimelineRow key={key} id={`passport-activity-${key}`} $mark={marked}>
                            <time>{at}</time>
                            <ActivityBody>
                              <span>{tr(item.body, item.bodyHe)}</span>
                              {scanCheck ? <PhotoCheckSticker check={scanCheck} /> : null}
                              {item.kind === 'added' ? (
                                <>
                                  <IdentifyBadge identification={plant.identification} notInCatalog={plant.speciesId === OTHER_CATEGORY_ID} compact />
                                  {checks?.length ? <PhotoChecks photos={photos} checks={checks} size="sm" /> : null}
                                </>
                              ) : null}
                            </ActivityBody>
                          </TimelineRow>
                        )
                      })}
                    </Timeline>
                  )
                }
                if (plant.history.length === 0) return <Muted>{t.passport.noHistory}</Muted>
                return (
                  <Timeline>
                    {plant.history.map((entry, index) => {
                      const key = `${plant.id}:${index}`
                      const marked = key === activityKey
                      return (
                        <TimelineRow key={key} id={`passport-activity-${key}`} $mark={marked}>
                          <time>{entry.at}</time>
                          <span>{tr(entry.label, entry.labelHe)}</span>
                        </TimelineRow>
                      )
                    })}
                  </Timeline>
                )
              })()}
            </>
          )}

          {activeTab === 'market' && marketOn && (
            <>
              {!dialog && toast && <Toast role="status">{toast}</Toast>}
              <FeatureGate
                placement="passport.market"
                title={t.passport.marketTab}
                pending={<PassportMarket plant={plant} selectedListingId={listing?.id} masked />}
              >
                <PassportMarket plant={plant} selectedListingId={listing?.id} />
              </FeatureGate>
            </>
          )}
        </Panel>
      </Main>
    </Board>
    </Frame>
  )
}
