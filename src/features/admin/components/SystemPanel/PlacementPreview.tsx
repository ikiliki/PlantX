import { type ReactNode, useEffect, useState } from 'react'
import { DeviceView } from '../../../../lib/useDevice'
import { HomeToday } from '../../../discover/components/HomeToday/HomeToday'
import { MarketRail } from '../../../feed/components/MarketRail/MarketRail'
import { RankRail } from '../../../feed/components/RankRail/RankRail'
import { WikiRail } from '../../../feed/components/WikiRail/WikiRail'
import { GreenhousePlantCard } from '../../../greenhouse/components/GreenhousePlantCard/GreenhousePlantCard'
import { GreenhouseLevelCard } from '../../../greenhouse/components/GreenhouseLevelCard/GreenhouseLevelCard'
import { PlantPassport } from '../../../greenhouse/components/PlantPassport/PlantPassport'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { CategoriesPage } from '../../../../pages/CategoriesPage/CategoriesPage'
import { CategoryPage } from '../../../../pages/CategoryPage/CategoryPage'
import { DiscoverPage } from '../../../../pages/DiscoverPage/DiscoverPage'
import { FeedPage } from '../../../../pages/FeedPage/FeedPage'
import { GreenhousePage } from '../../../../pages/GreenhousePage/GreenhousePage'
import { MarketClassPage } from '../../../../pages/MarketClassPage/MarketClassPage'
import { MarketPage } from '../../../../pages/MarketPage/MarketPage'
import { RankPage } from '../../../../pages/RankPage/RankPage'
import { TodoPage } from '../../../../pages/TodoPage/TodoPage'
import { WikiPage } from '../../../../pages/WikiPage/WikiPage'
import { FeatureGate } from '../../../../components/FeatureGate/FeatureGate'
import { PLACEMENTS, placementRelease, type DeviceId, type FeatureId, type PlacementId } from '../../../../theme/release'
import { CardSlot, DeviceFrame, DeviceWell, Frame, Off, Stage } from './PlacementPreview.styles'

function ownerIdOf(signedIn: boolean, userId: string | undefined, visitorId: string) {
  return signedIn && userId ? userId : visitorId
}

function LevelPreview() {
  const { db, currentUser, signedIn } = useStore()
  return <GreenhouseLevelCard ownerId={ownerIdOf(signedIn, currentUser?.id, db.visitorId)} />
}

function featureName(id: FeatureId, t: ReturnType<typeof useI18n>['t']) {
  if (id === 'news') return t.nav.home
  if (id === 'todo') return t.nav.todo
  if (id === 'market') return t.nav.market
  if (id === 'greenhouse') return t.nav.greenhouse
  if (id === 'rank') return t.nav.rank
  return t.nav.wiki
}

function CardPreview() {
  const { db, currentUser, signedIn } = useStore()
  const { t } = useI18n()
  const ownerId = ownerIdOf(signedIn, currentUser?.id, db.visitorId)
  const plant = db.plants.find((item) => item.ownerId === ownerId) ?? db.plants[0]
  if (!plant) return null
  return (
    <CardSlot>
      <FeatureGate
        placement="greenhouse.card"
        title={t.admin.placement['greenhouse.card']}
        body={t.admin.systemFrom.replace('{feature}', t.nav.greenhouse)}
      >
        <GreenhousePlantCard plant={plant} />
      </FeatureGate>
    </CardSlot>
  )
}

function PassportPreview() {
  const { db, currentUser, signedIn } = useStore()
  const ownerId = ownerIdOf(signedIn, currentUser?.id, db.visitorId)
  const plant = db.plants.find((item) => item.ownerId === ownerId) ?? db.plants[0]
  if (!plant) return null
  return <PlantPassport plantId={plant.id} embedded initialTab="market" />
}

function RankPassportPreview() {
  const { db, currentUser, signedIn } = useStore()
  const ownerId = ownerIdOf(signedIn, currentUser?.id, db.visitorId)
  const plant = db.plants.find((item) => item.ownerId === ownerId) ?? db.plants[0]
  if (!plant) return null
  return <PlantPassport plantId={plant.id} embedded initialTab="story" />
}

function TodoPassportPreview() {
  const { db, currentUser, signedIn } = useStore()
  const ownerId = ownerIdOf(signedIn, currentUser?.id, db.visitorId)
  const plant = db.plants.find((item) => item.ownerId === ownerId) ?? db.plants[0]
  if (!plant) return null
  return <PlantPassport plantId={plant.id} embedded initialTab="care" />
}

function ClassPreview() {
  const { db } = useStore()
  const classId = db.marketClasses[0]?.id
  if (!classId) return null
  return <MarketClassPage classId={classId} />
}

function SpeciesPreview() {
  const { db } = useStore()
  const speciesId = db.species[0]?.id
  if (!speciesId) return null
  return <CategoryPage speciesId={speciesId} />
}

function previewFor(id: PlacementId): ReactNode {
  switch (id) {
    case 'home.feed':
      return <DiscoverPage />
    case 'feed.board':
    case 'feed.social':
      return <FeedPage />
    case 'home.market':
      return <MarketRail />
    case 'home.rank':
      return <RankRail />
    case 'home.wiki':
      return <WikiRail />
    case 'home.todo':
      return <TodoPage />
    case 'home.today':
      return <HomeToday />
    case 'market.board':
      return <MarketPage />
    case 'market.class':
      return <ClassPreview />
    case 'market.categories':
      return <CategoriesPage />
    case 'market.category':
      return <SpeciesPreview />
    case 'greenhouse.board':
      return <GreenhousePage />
    case 'todo.board':
      return <TodoPage />
    case 'profile.market.stats':
    case 'profile.market.trust':
      return <GreenhousePage />
    case 'greenhouse.card':
      return <CardPreview />
    case 'greenhouse.level':
      return <LevelPreview />
    case 'passport.market':
      return <PassportPreview />
    case 'passport.rank':
      return <RankPassportPreview />
    case 'passport.todo':
      return <TodoPassportPreview />
    case 'rank.board':
      return <RankPage />
    case 'wiki.board':
      return <WikiPage />
    default: {
      const unreachable: never = id
      return unreachable
    }
  }
}

const DESKTOP_WIDTH = 1280

/** Renders its children as that device would: a phone-wide frame, or a desktop-wide one zoomed down to fit. */
export function DevicePreview({ device, children }: { device: DeviceId; children: ReactNode }) {
  const [well, setWell] = useState<HTMLDivElement | null>(null)
  const [room, setRoom] = useState(DESKTOP_WIDTH)
  useEffect(() => {
    if (!well) return
    const observer = new ResizeObserver(([entry]) => setRoom(entry.contentRect.width))
    observer.observe(well)
    return () => observer.disconnect()
  }, [well])
  return (
    <DeviceWell ref={setWell}>
      <DeviceFrame inert $device={device} $zoom={device === 'desktop' ? Math.min(1, room / DESKTOP_WIDTH) : 1}>
        <DeviceView device={device}>{children}</DeviceView>
      </DeviceFrame>
    </DeviceWell>
  )
}

/** Live render of a placement at its full height; with a device, at that device's width and flags. */
export function PlacementPreview({ id, device }: { id: PlacementId; device?: DeviceId }) {
  const { t } = useI18n()
  const system = useStore().db.system
  const placement = placementRelease(system, id, device)
  const featureId = PLACEMENTS.find((item) => item.id === id)?.featureId

  if (!placement.enabled) {
    const fromParent = featureId && !system.features[featureId].enabled
    return (
      <Off>
        {fromParent
          ? t.admin.systemFromOff.replace('{feature}', featureName(featureId, t))
          : t.admin.systemHidden}
      </Off>
    )
  }

  if (device) return <DevicePreview device={device}>{previewFor(id)}</DevicePreview>

  return (
    <Frame inert>
      <Stage>{previewFor(id)}</Stage>
    </Frame>
  )
}
