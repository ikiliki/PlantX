import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../../../components/Button/Button'
import { FeatureGate } from '../../../../components/FeatureGate/FeatureGate'
import { GradeChip } from '../../../../components/GradeChip/GradeChip'
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
import { useStore } from '../../../../mock/store'
import { isPlacementEnabled } from '../../../../theme/release'
import type { StageBand } from '../../../../mock/types'
import { aggregateCommunityGrade, formatGradeWhen } from '../../communityGrade'
import { PlantCatalogMark } from '../CatalogMark/CatalogMark'
import { PassportMarket } from '../PassportMarket/PassportMarket'
import { PlantPhotoGallery } from '../PlantPhotoGallery/PlantPhotoGallery'
import {
  ActionRow,
  Aside,
  AsideLabel,
  AsideStat,
  AsideStats,
  Board,
  Code,
  AsideStatButton,
  GradeRow,
  IdentityHead,
  Main,
  Missing,
  Muted,
  NameBlock,
  OwnerAvatar,
  OwnerLink,
  OwnerMeta,
  OwnerName,
  Panel,
  PhotoIcon,
  PhotoIconButton,
  PriceTip,
  Qty,
  Rating,
  SectionTitle,
  ShowMore,
  StatSpacer,
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
} from './PlantPassport.styles'

type TabId = 'grading' | 'activity' | 'market'

/** Drop trailing ×N (or xN) quantity suffixes baked into listing titles. */
function titleWithoutQuantity(text: string) {
  return text.replace(/\s*[×x]\s*[\d,.]+$/iu, '').trim()
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
}

function stageName(stage: StageBand | undefined, labels: { mature: string; established: string; rooted: string; cutting: string }) {
  if (stage === 'MATURE') return labels.mature
  if (stage === 'EST') return labels.established
  if (stage === 'ROOTED') return labels.rooted
  if (stage === 'CUT') return labels.cutting
  return undefined
}

export function PlantPassport({
  plantId,
  embedded = false,
  dialog = false,
  initialTab = 'grading',
  activityKey,
}: {
  plantId: string
  embedded?: boolean
  /** Fixed popup: photo stays put, the white page scrolls. */
  dialog?: boolean
  initialTab?: TabId
  /** History row to mark when the activity tab is open. */
  activityKey?: string
}) {
  const { db, currentUser, signedIn, reserveListing } = useStore()
  const { openAuth } = useAuth()
  const { t, tr, formatMoney, locale } = useI18n()
  const plant = db.plants.find((item) => item.id === plantId)
  const [tab, setTab] = useState<TabId>(initialTab)
  const [customsOpen, setCustomsOpen] = useState(false)
  const listing = db.listings.find((item) => item.plantId === plantId && item.status === 'active')
  const [toast, setToast] = useState('')
  const [photoIndex, setPhotoIndex] = useState(0)
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false)

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
      <Board $embedded={embedded} $dialog={dialog}>
        <Missing id="plant-passport-title">{t.passport.notFound}</Missing>
      </Board>
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
  const traits = [
    { label: t.market.size, value: plant.sizeBand ?? plant.sizeGrade },
    ...(stage ? [{ label: t.market.stage, value: stage }] : []),
    { label: t.sell.location, value: tr(plant.locationZone, plant.locationZoneHe) },
  ]
  const catalogCategory = categoryBySpeciesId(db.catalog, plant.speciesId)
  const catalogSub = subcategoryOfPlant(db.catalog, plant)
  const categoryLabel = catalogCategory ? catalogName(catalogCategory, locale) : ''
  const subLabel = catalogSub
    ? catalogName(catalogSub, locale)
    : plant.variety
      ? tr(plant.variety, plant.varietyHe ?? plant.variety)
      : ''

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
  const tabs: { id: TabId; label: string }[] = [
    ...(rankOn ? [{ id: 'grading' as const, label: t.passport.gradingTab }] : []),
    { id: 'activity', label: t.passport.activityTab },
    ...(marketOn ? [{ id: 'market' as const, label: t.passport.marketTab }] : []),
  ]
  const activeTab: TabId =
    tab === 'market' && !marketOn ? (rankOn ? 'grading' : 'activity') : tab === 'grading' && !rankOn ? 'activity' : tab

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
  const ownerName = owner ? (locale === 'he' ? owner.nameHe : owner.name) : ''

  const title = titleWithoutQuantity(tr(plant.title, plant.titleHe))

  return (
    <Board $embedded={embedded} $dialog={dialog}>
      <Aside $embedded={embedded} $dialog={dialog}>
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
            </PhotoIcon>
          </PhotoIconButton>
          <NameBlock>
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
                {categoryLabel && subLabel && <TaxonomySep aria-hidden>·</TaxonomySep>}
                {subLabel && <SubName>{subLabel}</SubName>}
              </TaxonomyRow>
            )}
            <Code>{plant.code}</Code>
            <Title id="plant-passport-title" as={embedded ? 'h2' : 'h1'}>
              {title}
            </Title>
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

        <StatSpacer />

        <AsideStats>
          <AsideStat title={gradeLabel} data-grade-source={communityGrade ? 'community' : 'catalog'}>
            <dt>{gradeLabel}</dt>
            <dd>{gradeLetter}</dd>
          </AsideStat>
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
          {traits.map((trait) => (
            <AsideStat key={trait.label}>
              <dt>{trait.label}</dt>
              <dd>{trait.value}</dd>
            </AsideStat>
          ))}
          <AsideStat>
            <dt>{t.market.quantity}</dt>
            <dd>×{plant.quantity}</dd>
          </AsideStat>
          {customsOpen &&
            customFields.map((field) => (
              <AsideStat key={field.id}>
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </AsideStat>
            ))}
        </AsideStats>
        {customFields.length > 0 && (
          <ShowMore type="button" onClick={() => setCustomsOpen((open) => !open)}>
            {customsOpen ? t.passport.showLess : t.passport.showMore}
          </ShowMore>
        )}

        {owner && (
          <>
            <AsideLabel>{t.passport.owner}</AsideLabel>
            <OwnerLink to={`/sellers/${owner.id}`} aria-label={`${t.passport.owner}: ${ownerName}`}>
              <OwnerAvatar aria-hidden>{initials(ownerName)}</OwnerAvatar>
              <OwnerMeta>
                <OwnerName>{ownerName}</OwnerName>
                <Rating>★ {owner.rating}</Rating>
              </OwnerMeta>
            </OwnerLink>
          </>
        )}
      </Aside>

      <Main $embedded={embedded} $dialog={dialog}>
        <PlantPhotoGallery
          photos={photos}
          alt={title}
          embedded={embedded}
          dialog={dialog}
          index={safeIndex}
          onIndexChange={setPhotoIndex}
          viewerOpen={photoViewerOpen}
          onViewerOpenChange={setPhotoViewerOpen}
        />

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
                        <GradeChip grade={grade.letter} />
                        <span>{t.grade.anonymousEntry}</span>
                      </GradeRow>
                    </TimelineRow>
                  ))}
                </Timeline>
              )}
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
                        return (
                          <TimelineRow key={key} id={`passport-activity-${key}`} $mark={marked}>
                            <time>{at}</time>
                            <span>{tr(item.body, item.bodyHe)}</span>
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
  )
}
