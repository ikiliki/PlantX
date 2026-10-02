import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FeatureGate } from '../../components/FeatureGate/FeatureGate'
import { LoaderShell } from '../../components/LoaderShell/LoaderShell'
import { PageGate } from '../../components/PageGate/PageGate'
import { AuthPanel } from '../../features/auth/components/AuthPanel/AuthPanel'
import { CollectionBoard, greenhouseFilter } from '../../features/greenhouse/components/CollectionBoard/CollectionBoard'
import { GreenhouseDirectory } from '../../features/greenhouse/components/GreenhouseDirectory/GreenhouseDirectory'
import { GreenhousePublic } from '../../features/greenhouse/components/GreenhousePublic/GreenhousePublic'
import { GreenhouseScope, useHeaderNav, type GreenhouseScopeId } from '../../features/greenhouse/components/GreenhouseScope/GreenhouseScope'
import { GreenhouseLevelCard } from '../../features/greenhouse/components/GreenhouseLevelCard/GreenhouseLevelCard'
import { AddPlantDialog } from '../../features/greenhouse/components/AddPlantDialog/AddPlantDialog'
import { useI18n } from '../../i18n/I18nProvider'
import { ownerActivity } from '../../features/greenhouse/ownerActivity'
import { useStore } from '../../mock/store'
import { useSectionFetch, useServerSlices } from '../../mock/useServerSlices'
import { forAudience } from '../../theme/audience'
import { isPlacementReady } from '../../theme/release'
import type { ComponentView } from '../../theme/view'
import { GuestAuth, HeadBlock, Heading, HeadingCopy, Page, PublicHeading, PublicPage } from './GreenhousePage.styles'

const WIDGET_PLANTS = 2

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
  const { db } = useStore()
  const { t, tr } = useI18n()
  const user = db.users.find((item) => item.id === ownerId && item.role !== 'guest')
  const name = user ? tr(user.name, user.nameHe) : t.nav.greenhouse
  const plants = <GreenhousePublic ownerId={ownerId} compact={compact} />
  if (compact) return plants
  return (
    <PageGate pageId="greenhouse" title={name}>
      <FeatureGate placement="greenhouse.board" title={name}>
        <PublicPage>
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
  const fetching = useSectionFetch(true, ['plants', 'updates', 'todos'])
  const { db, fullDb, currentUser, signedIn } = useStore()
  const { t, tr } = useI18n()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [freshId, setFreshId] = useState<string>()
  const headerNav = useHeaderNav()
  const [params, setParams] = useSearchParams()
  const filter = greenhouseFilter(params.get('tab'))
  const scope: GreenhouseScopeId = view === 'page' && params.get('scope') === 'global' ? 'global' : 'mine'
  const ownerId = signedIn && currentUser ? currentUser.id : db.visitorId

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

  const board = (
    <Page $fill={view === 'page' && scope === 'mine'}>
      <HeadBlock>
        {view === 'page' && !headerNav && <GreenhouseScope value={scope} onChange={setScope} />}
        <Heading>
        <HeadingCopy>
          <h1>{t.greenhouse.title}</h1>
        </HeadingCopy>
        {view === 'page' && scope === 'mine' && signedIn ? <GreenhouseLevelCard ownerId={ownerId} /> : null}
        </Heading>
      </HeadBlock>

      {fetching ? (
        <LoaderShell busy compact={view === 'widget'} />
      ) : scope === 'global' ? (
        <GreenhouseDirectory />
      ) : (
        <CollectionBoard
          plants={view === 'widget' ? living.slice(0, WIDGET_PLANTS) : living}
          sold={view === 'widget' ? [] : sold}
          activity={view === 'widget' ? [] : activity}
          filter={filter}
          onFilter={setFilter}
          onAdd={() => setAdding(true)}
          compact={view === 'widget'}
          freshId={freshId}
        />
      )}

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
        {!isPlacementReady(db.system, 'greenhouse.board')
          ? board
          : forAudience(signedIn, {
              guest: (
                <Page>
                  <GuestAuth>
                    <AuthPanel
                      reason="buy"
                      dialog
                      titleId="greenhouse-auth-title"
                      onSuccess={() => navigate('/greenhouse', { replace: true })}
                    />
                  </GuestAuth>
                </Page>
              ),
              signedIn: board,
            })}
      </FeatureGate>
    </PageGate>
  )
}
