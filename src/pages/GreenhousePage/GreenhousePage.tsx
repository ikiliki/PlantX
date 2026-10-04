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
  isPublicGreenhouse,
} from '../../features/greenhouse/components/GreenhouseDirectory/GreenhouseDirectory'
import {
  CollectionGrid,
  GreenhousePlantCardSkeleton,
} from '../../features/greenhouse/components/GreenhousePlantCard/GreenhousePlantCard'
import { GreenhousePublic } from '../../features/greenhouse/components/GreenhousePublic/GreenhousePublic'
import { GreenhouseBack, GreenhouseScope, useHeaderNav, type GreenhouseScopeId } from '../../features/greenhouse/components/GreenhouseScope/GreenhouseScope'
import {
  GreenhouseLevelCard,
  GreenhouseLevelSkeleton,
  GreenhouseLevelView,
} from '../../features/greenhouse/components/GreenhouseLevelCard/GreenhouseLevelCard'
import { greenhouseLevel } from '../../features/greenhouse/greenhouseLevel'
import { AddPlantDialog } from '../../features/greenhouse/components/AddPlantDialog/AddPlantDialog'
import { useI18n } from '../../i18n/I18nProvider'
import { publicGrowerName } from '../../features/profile/avatarIcons'
import { ownerActivity } from '../../features/greenhouse/ownerActivity'
import { useStore } from '../../mock/store'
import { useSectionFetch, useServerSlices } from '../../mock/useServerSlices'
import { forAudience } from '../../theme/audience'
import type { ComponentView } from '../../theme/view'
import { HeadBlock, Heading, HeadingCopy, Page, PublicHeading, PublicPage } from './GreenhousePage.styles'

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
  const headerNav = useHeaderNav()
  // A shared link explains itself to a guest instead of bouncing to the list.
  if (!signedIn) {
    const card = <GuestView card title={t.guest.globalTitle} body={t.guest.globalBody} action={t.guest.logIn} />
    if (compact) return card
    return (
      <PageGate pageId="greenhouse" title={t.nav.greenhouse}>
        <PublicPage>
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
          {headerNav ? null : <GreenhouseBack />}
        </PublicPage>
      </PageGate>
    )
  }
  const plants = <GreenhousePublic ownerId={ownerId} compact={compact} />
  if (compact) return plants
  if (!usersLoading && (!user || !isPublicGreenhouse(user, currentUser))) {
    return <Navigate to="/greenhouse?scope=global" replace />
  }
  return (
    <PageGate pageId="greenhouse" title={name}>
      <FeatureGate placement="greenhouse.board" title={name}>
        <PublicPage>
          <PublicHeading>
            <h1>{name}</h1>
            <GreenhouseLevelCard ownerId={ownerId} publicView />
          </PublicHeading>
          {plants}
          {headerNav ? null : <GreenhouseBack />}
        </PublicPage>
      </FeatureGate>
    </PageGate>
  )
}

function GreenhouseOwner({ view }: { view: ComponentView }) {
  const fetching = useSectionFetch(true, ['plants', 'updates', 'todos'])
  const { db, fullDb, currentUser, signedIn } = useStore()
  const { t, tr } = useI18n()
  const [adding, setAdding] = useState(false)
  const [freshId, setFreshId] = useState<string>()
  const headerNav = useHeaderNav()
  const [params, setParams] = useSearchParams()
  const filter = greenhouseFilter(params.get('tab'))
  const scope: GreenhouseScopeId = view === 'page' && params.get('scope') === 'global' ? 'global' : 'mine'
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

  const setScope = (next: GreenhouseScopeId) => {
    const nextParams = new URLSearchParams(params)
    if (next === 'mine') nextParams.delete('scope')
    else nextParams.set('scope', next)
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
  // Log in stays in the top bar and in Add Plant, so the board has no log-in card.
  const guestBody =
    scope === 'global' ? (
      <GuestCurtain card={<GuestView card title={t.guest.globalTitle} body={t.guest.globalBody} action={t.guest.logIn} />}>
        <GreenhouseDirectorySkeleton />
      </GuestCurtain>
    ) : (
      <CollectionBoard
        skeleton="guest"
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

  const memberBody = fetching ? (
    loadingBody
  ) : scope === 'global' ? (
    <GreenhouseDirectory />
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

  // A guest gets the real header with an empty greenhouse (level 1, no plants), not a blurred placeholder.
  const levelCard = forAudience(signedIn, {
    guest: <GreenhouseLevelView summary={greenhouseLevel('', [], [])} />,
    signedIn: <GreenhouseLevelCard ownerId={ownerId} />,
  })

  const board = (
    <Page $fill={view === 'page' && scope === 'mine'}>
      <HeadBlock>
        {view === 'page' && !headerNav && <GreenhouseScope value={scope} onChange={setScope} floating />}
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
