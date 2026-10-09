import { useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { FeatureGate } from '../../components/FeatureGate/FeatureGate'
import { GuestCurtain } from '../../components/GuestCurtain/GuestCurtain'
import { GuestView } from '../../components/GuestView/GuestView'
import { PageGate } from '../../components/PageGate/PageGate'
import { CollectionBoard, greenhouseFilter } from '../../features/greenhouse/components/CollectionBoard/CollectionBoard'
import {
  GreenhouseDirectory,
  GreenhouseDirectorySkeleton,
  canOpenGreenhouse,
} from '../../features/greenhouse/components/GreenhouseDirectory/GreenhouseDirectory'
import {
  CollectionGrid,
  GreenhousePlantCardSkeleton,
} from '../../features/greenhouse/components/GreenhousePlantCard/GreenhousePlantCard'
import { GreenhousePublic } from '../../features/greenhouse/components/GreenhousePublic/GreenhousePublic'
import {
  GreenhouseBackLink,
  GreenhouseTabs,
  type GreenhouseScopeId,
} from '../../features/greenhouse/components/GreenhouseTabs/GreenhouseTabs'
import {
  GreenhouseLevelCard,
  GreenhouseLevelSkeleton,
  GreenhouseLevelView,
} from '../../features/greenhouse/components/GreenhouseLevelCard/GreenhouseLevelCard'
import { greenhouseLevel } from '../../features/greenhouse/greenhouseLevel'
import { AddPlantDialog } from '../../features/greenhouse/components/AddPlantDialog/AddPlantDialog'
import { useI18n } from '../../i18n/I18nProvider'
import { publicGrowerName } from '../../features/profile/avatarIcons'
import { guestPlantAsPlant } from '../../features/greenhouse/guestPlants'
import { ownerActivity } from '../../features/greenhouse/ownerActivity'
import { useStore } from '../../mock/store'
import { useSectionFetch, useServerSlices } from '../../mock/useServerSlices'
import { forAudience } from '../../theme/audience'
import { resolveArea } from '../../mock/locations'
import { accountHref } from '../../features/profile/components/AccountDialog/AccountDialog'
import { MyScanAllowance } from '../../features/greenhouse/components/ScanQuotaNote/ScanQuotaNote'
import type { ComponentView } from '../../theme/view'
import {
  HeadBlock,
  Heading,
  HeadingCopy,
  Page,
  PlaceCopy,
  PlaceIcon,
  PlacePrompt,
  PublicHeading,
  PublicPage,
} from './GreenhousePage.styles'

const WIDGET_PLANTS = 2
const PUBLIC_SKELETON_CARDS = 8

export function GreenhousePage({
  view = 'page',
  ownerId,
  compact,
}: {
  view?: ComponentView
  /** When set, show that owner's shared plants. */
  ownerId?: string
  compact?: boolean
}) {
  useServerSlices(['users', 'plants', 'updates', 'todos', 'catalog'])
  if (ownerId) {
    return <PublicGreenhouse ownerId={ownerId} compact={compact ?? view === 'widget'} />
  }
  return <GreenhouseOwner view={view} />
}

function PublicGreenhouse({ ownerId, compact }: { ownerId: string; compact: boolean }) {
  const { db, currentUser, signedIn } = useStore()
  const { t, locale } = useI18n()
  const usersLoading = useSectionFetch(!compact, ['users'])
  const user = db.users.find((item) => item.id === ownerId && item.role !== 'guest')
  const name = user ? publicGrowerName(user, locale === 'he') : t.nav.greenhouse
  // A shared link explains itself to a guest instead of bouncing to the list.
  if (!signedIn) {
    const card = <GuestView card title={t.guest.globalTitle} body={t.guest.globalBody} action={t.guest.logIn} />
    if (compact) return card
    return (
      <PageGate pageId="greenhouse" title={t.nav.greenhouse}>
        <PublicPage>
          <GreenhouseBackLink />
          <PublicHeading>
            <h1>{t.nav.greenhouse}</h1>
            <GreenhouseLevelSkeleton blurred />
          </PublicHeading>
          <GuestCurtain card={card}>
            <CollectionGrid>
              {Array.from({ length: PUBLIC_SKELETON_CARDS }, (_, index) => (
                <GreenhousePlantCardSkeleton key={index} />
              ))}
            </CollectionGrid>
          </GuestCurtain>
        </PublicPage>
      </PageGate>
    )
  }
  const plants = <GreenhousePublic ownerId={ownerId} compact={compact} />
  if (compact) return plants
  if (!usersLoading && (!user || !canOpenGreenhouse(user, currentUser))) {
    return <Navigate to="/greenhouse?scope=global" replace />
  }
  return (
    <PageGate pageId="greenhouse" title={name}>
      <FeatureGate placement="greenhouse.board" title={name}>
        <PublicPage>
          <GreenhouseBackLink />
          <PublicHeading>
            <h1>{name}</h1>
            <GreenhouseLevelCard ownerId={ownerId} publicView />
          </PublicHeading>
          {plants}
        </PublicPage>
      </FeatureGate>
    </PageGate>
  )
}

function GreenhouseOwner({ view }: { view: ComponentView }) {
  const [params, setParams] = useSearchParams()
  const scope: GreenhouseScopeId = view === 'page' && params.get('scope') === 'global' ? 'global' : 'mine'
  // Mine waits on the member's own plants, activity and tasks. Global waits on its own list (#77).
  const fetching = useSectionFetch(scope === 'mine', ['plants', 'updates', 'todos'])
  const { db, fullDb, currentUser, signedIn, guestPlants, scanQuota } = useStore()
  const { t, tr } = useI18n()
  const [adding, setAdding] = useState(false)
  const [freshId, setFreshId] = useState<string>()
  const filter = greenhouseFilter(params.get('tab'))
  const ownerId = currentUser?.id ?? ''

  const mine = db.plants.filter((p) => p.ownerId === ownerId)
  const living = mine.filter((p) => p.status === 'owned' || p.status === 'listed')
  const sold = mine.filter((p) => p.status === 'sold')

  const activity = ownerActivity(fullDb, ownerId, mine, tr, t)

  const setFilter = (next: typeof filter) => {
    const nextParams = new URLSearchParams(params)
    if (next === 'all') nextParams.delete('tab')
    else nextParams.set('tab', next)
    setParams(nextParams, { replace: true })
  }

  const openAdd = () => setAdding(true)

  // Tasks (and any link) can ask for Add Plant with ?add=1: open it here, then drop the flag.
  useEffect(() => {
    if (view !== 'page' || params.get('add') !== '1') return
    setAdding(true)
    const nextParams = new URLSearchParams(params)
    nextParams.delete('add')
    setParams(nextParams, { replace: true })
  }, [params, setParams, view])

  // A guest sees the same layout with placeholders (nothing is fetched) and the Add tile.
  // A guest's own plants, kept in this browser until they sign in.
  const guestShelf = guestPlants.map(guestPlantAsPlant)
  // Log in stays in the top bar and in Add Plant, so the board has no log-in card.
  const guestBody =
    scope === 'global' ? (
      <GuestCurtain card={<GuestView card title={t.guest.globalTitle} body={t.guest.globalBody} action={t.guest.logIn} />}>
        <GreenhouseDirectorySkeleton />
      </GuestCurtain>
    ) : (
      <CollectionBoard
        skeleton="guest"
        guestPlants={guestShelf}
        freshId={freshId}
        plants={[]}
        sold={[]}
        activity={[]}
        onAdd={openAdd}
        compact={view === 'widget'}
      />
    )

  const loadingBody =
    scope === 'global' ? (
      <GreenhouseDirectorySkeleton />
    ) : (
      <CollectionBoard
        skeleton="loading"
        addDisabled
        plants={[]}
        sold={[]}
        activity={[]}
        onAdd={openAdd}
        compact={view === 'widget'}
      />
    )

  const memberBody = scope === 'global' ? (
    <GreenhouseDirectory />
  ) : fetching ? (
    loadingBody
  ) : (
    <CollectionBoard
      plants={view === 'widget' ? living.slice(0, WIDGET_PLANTS) : living}
      sold={view === 'widget' ? [] : sold}
      activity={view === 'widget' ? [] : activity}
      filter={filter}
      onFilter={setFilter}
      onAdd={openAdd}
      compact={view === 'widget'}
      freshId={freshId}
    />
  )

  // The owner's own tiles at the end of the level card: AI scans left today, and (a new account with no
  // place yet, #20) a link to set it.
  const showScans = currentUser?.role === 'admin' || Boolean(scanQuota)
  const needsPlace = !resolveArea(currentUser?.region)
  const scansTile = showScans ? <MyScanAllowance /> : undefined
  const placeTile = needsPlace ? (
    <PlacePrompt to={accountHref()}>
      <PlaceIcon aria-hidden>📍</PlaceIcon>
      <PlaceCopy>
        <strong>{t.greenhouse.setPlaceShort}</strong>
        <span>{t.greenhouse.setPlaceHint}</span>
      </PlaceCopy>
    </PlacePrompt>
  ) : undefined

  // A guest gets the real header with an empty greenhouse (level 1, no plants), not a blurred placeholder.
  const levelCard = forAudience(signedIn, {
    guest: <GreenhouseLevelView summary={greenhouseLevel('', [], [])} />,
    signedIn: <GreenhouseLevelCard ownerId={ownerId} scans={scansTile} place={placeTile} />,
  })

  const board = (
    <Page $fill={view === 'page' && scope === 'mine'}>
      <HeadBlock>
        {view === 'page' ? <GreenhouseTabs value={scope} /> : null}
        <Heading>
        <HeadingCopy>
          <h1>{t.greenhouse.title}</h1>
        </HeadingCopy>
        {view === 'page' && scope === 'mine' ? levelCard : null}
        </Heading>
      </HeadBlock>

      {forAudience(signedIn, { guest: guestBody, signedIn: memberBody })}

      {adding && (
        <AddPlantDialog
          onClose={() => setAdding(false)}
          onSaved={(plantId) => {
            setFreshId(plantId)
            setFilter('all')
          }}
        />
      )}
    </Page>
  )

  return (
    <PageGate pageId="greenhouse" title={t.greenhouse.title}>
      <FeatureGate placement="greenhouse.board" title={t.greenhouse.title}>
        {board}
      </FeatureGate>
    </PageGate>
  )
}
