import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Avatar } from '../../../../components/Avatar/Avatar'
import { formatFeedTime } from '../../formatFeedTime'
import { useI18n } from '../../../../i18n/I18nProvider'
import { personaScenarioId } from '../../../../mock/personas'
import { useStore } from '../../../../mock/store'
import type { FeedUpdate as FeedUpdateData } from '../../../../mock/types'
import { clientEnv } from '../../../../theme/plantxEnv'
import { VerifiedStamp } from '../../../greenhouse/components/VerifiedStamp/VerifiedStamp'
import { activityKindLabel } from '../../activityMoment'
import { ActivityMoment, MomentGlyph, MomentPlay } from '../ActivityMoment/ActivityMoment'
import { Card, Grower, Kind, Line, Meta, Open, ProfileButton, When } from './FeedUpdate.styles'

export function FeedUpdate({ update }: { update: FeedUpdateData }) {
  const { t, tr, locale } = useI18n()
  const { db } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const user = db.users.find((item) => item.id === update.userId && item.role !== 'guest')
  const name = user ? tr(user.name, user.nameHe) : ''
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
            <Avatar name={user.name} color={user.avatarColor} size={36} />
          </ProfileButton>
        ) : null}
        <Open type="button" onClick={() => setOpen(true)} aria-haspopup="dialog">
          <Meta>
            <Kind $kind={update.kind}>
              <MomentGlyph kind={update.kind} />
              {activityKindLabel(update.kind, t.feed)}
            </Kind>
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
