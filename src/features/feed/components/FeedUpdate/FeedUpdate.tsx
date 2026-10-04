import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Avatar } from '../../../../components/Avatar/Avatar'
import { XpChip } from '../XpChip/XpChip'
import { formatFeedTime } from '../../formatFeedTime'
import { useI18n } from '../../../../i18n/I18nProvider'
import { publicGrowerName } from '../../../profile/avatarIcons'
import { personaScenarioId } from '../../../../mock/personas'
import { useStore } from '../../../../mock/store'
import type { FeedUpdate as FeedUpdateData, FeedUpdateKind } from '../../../../mock/types'
import { SkeletonBar } from '../../../../components/Skeleton/Skeleton'
import { clientEnv } from '../../../../theme/plantxEnv'
import { VerifiedStamp } from '../../../greenhouse/components/VerifiedStamp/VerifiedStamp'
import { activityKindLabel } from '../../activityMoment'
import { ActivityMoment, MomentGlyph, MomentPlay } from '../ActivityMoment/ActivityMoment'
import { Card, Grower, Kind, Line, Meta, Open, ProfileButton, When } from './FeedUpdate.styles'

/** The order a placeholder feed cycles through, so it looks like a real day of care. */
export const SKELETON_FEED_KINDS: FeedUpdateKind[] = ['water', 'added', 'photo', 'water', 'scan', 'added']

/** Same card, kind tint and motion, with bars for the grower and text. No data, no requests. */
export function FeedUpdateSkeleton({ kind }: { kind: FeedUpdateKind }) {
  return (
    <Card $kind={kind} data-moment={kind}>
      <MomentPlay kind={kind} />
      <SkeletonBar width="36px" height={36} round />
      <Open as="div">
        <Meta>
          <Kind $kind={kind}>
            <MomentGlyph kind={kind} />
            <SkeletonBar width="64px" height={10} />
          </Kind>
          <SkeletonBar width="48px" height={10} />
        </Meta>
        <SkeletonBar height={16} />
        <SkeletonBar width="70%" height={16} />
        <SkeletonBar width="28px" height={10} />
      </Open>
    </Card>
  )
}

export function FeedUpdate({ update }: { update: FeedUpdateData }) {
  const { t, tr, locale } = useI18n()
  const { db } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const user = db.users.find((item) => item.id === update.userId && item.role !== 'guest')
  const name = user ? publicGrowerName(user, locale === 'he') : ''
  // Persona labels ("Rich — full living collection") describe demo accounts; real accounts show their name.
  const growerLabel = clientEnv() === 'mock' ? t.demo.personaScenarios[personaScenarioId(update.userId)] : name
  const verified = Boolean(user && (db.verifiedGreenhouseIds ?? []).includes(user.id))

  const openProfile = () => {
    navigate(
      { pathname: location.pathname, search: location.search, hash: location.hash },
      { state: { profilePreview: update.userId } },
    )
  }

  return (
    <>
      <Card $kind={update.kind} data-feed-update={update.id} data-moment={update.kind}>
        <MomentPlay kind={update.kind} />
        {user ? (
          <ProfileButton type="button" aria-label={name} onClick={openProfile}>
            <Avatar name={name} color={user.avatarColor} icon={user.avatarIcon} size={36} />
          </ProfileButton>
        ) : null}
        <Open type="button" onClick={() => setOpen(true)} aria-haspopup="dialog">
          <Meta>
            <Kind $kind={update.kind}>
              <MomentGlyph kind={update.kind} />
              {activityKindLabel(update.kind, t.feed)}
            </Kind>
            <XpChip kind={update.kind} />
            {verified ? <VerifiedStamp place="inline" /> : null}
            <Grower $verified={verified}>{verified ? t.greenhouse.verifiedGreenhouse : growerLabel}</Grower>
          </Meta>
          <Line>{tr(update.body, update.bodyHe)}</Line>
          <When dateTime={update.createdAt}>{formatFeedTime(update.createdAt, locale, t.feed)}</When>
        </Open>
      </Card>
      {open ? <ActivityMoment update={update} onClose={() => setOpen(false)} /> : null}
    </>
  )
}
