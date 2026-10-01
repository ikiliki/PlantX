import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../components/Avatar/Avatar'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { FeatureGate } from '../../components/FeatureGate/FeatureGate'
import { SectionHeading } from '../../components/SectionHeading/SectionHeading'
import { useAuth } from '../../features/auth/AuthProvider'
import { GreenhouseLure } from '../../features/discover/components/GreenhouseLure/GreenhouseLure'
import { PassportDialog } from '../../features/greenhouse/components/PassportDialog/PassportDialog'
import { ProfileSummary } from '../../features/profile/components/ProfileSummary/ProfileSummary'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import type { User } from '../../mock/types'
import { isPlacementReady } from '../../theme/release'
import type { ComponentView } from '../../theme/view'
import {
  Actions,
  ActivityButton,
  AvatarRing,
  Banner,
  Bullets,
  Card,
  Columns,
  Empty,
  Identity,
  Meta,
  NameRow,
  Page,
  Quote,
  Rows,
  Stack,
  Stars,
  Stat,
  Stats,
} from './ProfilePage.styles'

const WIDGET_ACTIVITY = 4

function fulfillmentPct(user: User) {
  const total = user.completedOrders + user.cancellations
  if (total <= 0) return null
  return Math.round((user.completedOrders / total) * 100)
}

function cancelPct(user: User) {
  const total = user.completedOrders + user.cancellations
  if (total <= 0) return 0
  return Math.round((user.cancellations / total) * 100)
}

export function ProfilePage({
  view = 'page',
  userId,
  titleId,
  compact,
}: {
  view?: ComponentView
  /** Public summary for a user — seller profile / overlay. */
  userId?: string
  titleId?: string
  compact?: boolean
}) {
  if (userId) {
    return <ProfileSummary userId={userId} titleId={titleId} compact={compact ?? view === 'widget'} />
  }
  return <ProfileOwner view={view} />
}

function ProfileOwner({ view }: { view: ComponentView }) {
  const { db, currentUser, signedIn, loginAs } = useStore()
  const { openAuth } = useAuth()
  const { t, tr, locale } = useI18n()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [focus, setFocus] = useState<{ plantId: string; key: string } | null>(null)
  const bleed = view === 'page'
  const showMarketStats = isPlacementReady(db.system, 'profile.market.stats')
  const showTrust = isPlacementReady(db.system, 'profile.market.trust')

  if (!signedIn || !currentUser) {
    return (
      <Page $bleed={bleed}>
        <Banner $bleed={bleed}>
          <AvatarRing>
            <Avatar name="Guest" color="#5E6B63" size={84} />
          </AvatarRing>
          <Identity>
            <NameRow>
              <h1>{t.profile.guestTitle}</h1>
            </NameRow>
            <Meta>{t.profile.guestBody}</Meta>
          </Identity>
          <Actions>
            <Button type="button" variant="growth" onClick={() => openAuth('buy')}>
              {t.profile.lockedAction}
            </Button>
          </Actions>
        </Banner>
      </Page>
    )
  }

  const name = locale === 'he' ? currentUser.nameHe : currentUser.name
  const region = tr(currentUser.region, currentUser.regionHe)
  const handle = currentUser.email?.split('@')[0]
  const verified = currentUser.verificationRate >= 0.5
  const hasTrust = currentUser.rating > 0 || currentUser.completedOrders > 0
  const fulfillment = fulfillmentPct(currentUser)
  const mine = db.plants.filter((plant) => plant.ownerId === currentUser.id)
  const activity = mine
    .flatMap((plant) =>
      plant.history.map((entry, index) => ({
        key: `${plant.id}:${index}`,
        plantId: plant.id,
        plant: tr(plant.title, plant.titleHe),
        at: entry.at,
        label: tr(entry.label, entry.labelHe),
      })),
    )
    .sort((a, b) => (a.at < b.at ? 1 : -1))
  const shown = view === 'widget' ? activity.slice(0, WIDGET_ACTIVITY) : activity

  const share = async () => {
    const url = `${window.location.origin}/profile/${currentUser.id}`
    try {
      if (navigator.share) {
        await navigator.share({ title: name, url })
        return
      }
    } catch {
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      /* ignore */
    } finally {
      window.setTimeout(() => setCopied(false), 1600)
    }
  }

  const signOut = () => {
    loginAs(null)
    navigate('/login')
  }

  return (
    <Page $bleed={bleed}>
      <Banner $bleed={bleed}>
        <AvatarRing>
          <Avatar name={name} color={currentUser.avatarColor} size={84} />
        </AvatarRing>
        <Identity>
          <NameRow>
            <h1>{name}</h1>
            {verified && <Badge $tone="lime">✓ {t.profile.identityVerified}</Badge>}
          </NameRow>
          <Meta>
            {handle ? `@${handle}` : t.roles[currentUser.role]} · {t.profile.memberSince} 2025
          </Meta>
          <Meta>
            {region} · {t.profile.pickupArea}
          </Meta>
        </Identity>
        <Actions>
          <Button variant="secondary" type="button" onClick={() => void share()}>
            {copied ? t.profile.copied : t.profile.share}
          </Button>
          <Button variant="secondary" type="button" onClick={signOut}>
            {t.profile.signOut}
          </Button>
        </Actions>
      </Banner>

      {showMarketStats && (
        <FeatureGate placement="profile.market.stats" title={t.profile.title}>
          <Stats $bleed={bleed}>
            <Stat>
              <dd>{hasTrust ? currentUser.rating.toFixed(1) : t.profile.unknown}</dd>
              <dt>{t.seller.rating}</dt>
            </Stat>
            <Stat>
              <dd>{hasTrust ? String(currentUser.completedOrders) : t.profile.unknown}</dd>
              <dt>{t.seller.orders}</dt>
            </Stat>
            <Stat>
              <dd>{hasTrust ? `${Math.round(currentUser.verificationRate * 100)}%` : t.profile.unknown}</dd>
              <dt>{t.seller.verification}</dt>
            </Stat>
            <Stat>
              <dd>{hasTrust ? `${cancelPct(currentUser)}%` : t.profile.unknown}</dd>
              <dt>{t.seller.cancellations}</dt>
            </Stat>
          </Stats>
        </FeatureGate>
      )}

      <Columns $rails={view === 'page'}>
        {showTrust && (
          <Stack>
            <FeatureGate placement="profile.market.trust" title={t.profile.sellerRecord}>
              <Card>
                <SectionHeading eyebrow={t.profile.trustEyebrow} title={t.profile.sellerRecord} />
                {hasTrust ? (
                  <>
                    <Quote>
                      <Stars>{'★'.repeat(Math.max(1, Math.round(currentUser.rating)))}</Stars> “{t.profile.reviewQuote}”
                    </Quote>
                    <Bullets>
                      <li>
                        {t.profile.fulfillment} {fulfillment ?? 0}%
                      </li>
                      <li>{t.profile.responds}</li>
                      {verified && <li>{t.profile.verifiedBy}</li>}
                    </Bullets>
                  </>
                ) : (
                  <Empty>{t.profile.unknownHint}</Empty>
                )}
              </Card>
            </FeatureGate>
          </Stack>
        )}

        <Card>
          <SectionHeading eyebrow={t.profile.activityEyebrow} title={t.profile.recentOrders} />
          {shown.length === 0 ? (
            <Empty>{t.profile.noOrders}</Empty>
          ) : (
            <Rows>
              {shown.map((entry) => (
                <ActivityButton key={entry.key} type="button" onClick={() => setFocus({ plantId: entry.plantId, key: entry.key })}>
                  <time dateTime={entry.at}>{entry.at}</time>
                  <strong>{entry.plant}</strong>
                  <span>{entry.label}</span>
                </ActivityButton>
              ))}
            </Rows>
          )}
        </Card>

        <GreenhouseLure />
      </Columns>

      {focus && (
        <PassportDialog
          plantId={focus.plantId}
          tab="activity"
          activityKey={focus.key}
          onClose={() => setFocus(null)}
        />
      )}
    </Page>
  )
}
