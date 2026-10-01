import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FeatureGate } from '../../components/FeatureGate/FeatureGate'
import { PageGate } from '../../components/PageGate/PageGate'
import { AuthPanel } from '../../features/auth/components/AuthPanel/AuthPanel'
import { CollectionBoard, greenhouseFilter } from '../../features/greenhouse/components/CollectionBoard/CollectionBoard'
import { GreenhousePublic } from '../../features/greenhouse/components/GreenhousePublic/GreenhousePublic'
import { GreenhouseWallet } from '../../features/greenhouse/components/GreenhouseWallet/GreenhouseWallet'
import { AddPlantDialog } from '../../features/greenhouse/components/AddPlantDialog/AddPlantDialog'
import { useSell } from '../../features/sell/SellProvider'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { useServerSlices } from '../../mock/useServerSlices'
import { forAudience } from '../../theme/audience'
import { isPlacementReady } from '../../theme/release'
import type { ComponentView } from '../../theme/view'
import { Description, Eyebrow, GuestAuth, Heading, HeadingCopy, Page } from './GreenhousePage.styles'

const WIDGET_PLANTS = 2

export function GreenhousePage({
  view = 'page',
  ownerId,
  compact,
}: {
  view?: ComponentView
  /** When set, show the public greenhouse + listings shelves for that owner. */
  ownerId?: string
  compact?: boolean
}) {
  useServerSlices(['users', 'plants', 'updates', 'catalog'])
  if (ownerId) {
    return <GreenhousePublic ownerId={ownerId} compact={compact ?? view === 'widget'} />
  }
  return <GreenhouseOwner view={view} />
}

function GreenhouseOwner({ view }: { view: ComponentView }) {
  const { db, currentUser, signedIn, refreshPhoto, confirmWater } = useStore()
  const { openSell } = useSell()
  const { t, tr, formatMoney } = useI18n()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [params, setParams] = useSearchParams()
  const filter = greenhouseFilter(params.get('tab'))
  const ownerId = signedIn && currentUser ? currentUser.id : db.visitorId

  const mine = db.plants.filter((p) => p.ownerId === ownerId)
  const living = mine.filter((p) => p.status === 'owned' || p.status === 'listed')
  const sold = mine.filter((p) => p.status === 'sold')

  const portfolioValue = mine.reduce((sum, p) => {
    const mc = db.marketClasses.find((m) => m.id === p.marketClassId)
    return sum + (mc ? mc.lastPrice * p.quantity : 0)
  }, 0)

  const activity = mine
    .flatMap((p) =>
      p.history.map((h) => ({
        ...h,
        plant: tr(p.title, p.titleHe),
        plantId: p.id,
        photo: p.photos[0],
      })),
    )
    .sort((a, b) => (a.at > b.at ? 1 : a.at < b.at ? -1 : 0))
    .slice(-40)
    .map((entry) => ({
      at: entry.at,
      plant: entry.plant,
      plantId: entry.plantId,
      photo: entry.photo,
      label: tr(entry.label, entry.labelHe),
    }))

  const setFilter = (next: typeof filter) => {
    const nextParams = new URLSearchParams(params)
    if (next === 'all') nextParams.delete('tab')
    else nextParams.set('tab', next)
    setParams(nextParams, { replace: true })
  }

  const board = (
    <Page>
      <Heading>
        <HeadingCopy>
          <Eyebrow>{t.greenhouse.eyebrow}</Eyebrow>
          <h1>{t.greenhouse.title}</h1>
          <Description>{t.greenhouse.description}</Description>
        </HeadingCopy>
        {view === 'page' && (
          <GreenhouseWallet
            title={t.greenhouse.wallet}
            value={formatMoney(portfolioValue)}
            valueLabel={t.exchange.portfolio}
            collection={String(living.length)}
            collectionLabel={t.greenhouse.collectionCount}
          />
        )}
      </Heading>

      <CollectionBoard
        plants={view === 'widget' ? living.slice(0, WIDGET_PLANTS) : living}
        sold={view === 'widget' ? [] : sold}
        activity={view === 'widget' ? [] : activity}
        filter={filter}
        onFilter={setFilter}
        onAdd={() => setAdding(true)}
        onList={openSell}
        onRefresh={refreshPhoto}
        onWater={confirmWater}
        compact={view === 'widget'}
      />

      {adding && <AddPlantDialog onClose={() => setAdding(false)} />}
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
