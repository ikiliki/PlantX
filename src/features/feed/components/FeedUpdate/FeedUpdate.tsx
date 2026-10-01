import { useLocation, useNavigate } from 'react-router-dom'
import { Avatar } from '../../../../components/Avatar/Avatar'
import { formatFeedTime } from '../../formatFeedTime'
import { useI18n } from '../../../../i18n/I18nProvider'
import { personaScenarioId } from '../../../../mock/personas'
import { useStore } from '../../../../mock/store'
import type { FeedUpdate as FeedUpdateData, FeedUpdateKind } from '../../../../mock/types'
import { Body, BodyLink, Card, Grower, Kind, Line, Meta, ProfileButton, When } from './FeedUpdate.styles'

function kindLabel(kind: FeedUpdateKind, t: ReturnType<typeof useI18n>['t']) {
  if (kind === 'photo') return t.feed.updatePhoto
  if (kind === 'water') return t.feed.updateWater
  if (kind === 'propagate') return t.feed.updatePropagate
  if (kind === 'grade') return t.feed.updateGrade
  if (kind === 'listing') return t.feed.updateListing
  if (kind === 'added') return t.feed.updateAdded
  if (kind === 'scan') return t.feed.updateScan
  return t.feed.updatePassport
}

export function FeedUpdate({ update }: { update: FeedUpdateData }) {
  const { t, tr, locale } = useI18n()
  const { db } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const scenario = personaScenarioId(update.userId)
  const scenarioLabel = t.demo.personaScenarios[scenario]
  const user = db.users.find((item) => item.id === update.userId && item.role !== 'guest')
  const name = user ? tr(user.name, user.nameHe) : ''
  const plantHref = update.plantId ? `/plants/${update.plantId}` : undefined

  const openProfile = () => {
    navigate(
      { pathname: location.pathname, search: location.search, hash: location.hash },
      { state: { profilePreview: update.userId } },
    )
  }

  const copy = (
    <>
      <Meta>
        <Kind>{kindLabel(update.kind, t)}</Kind>
        <Grower>{scenarioLabel}</Grower>
      </Meta>
      <Line>{tr(update.body, update.bodyHe)}</Line>
      <When dateTime={update.createdAt}>{formatFeedTime(update.createdAt, locale, t.feed)}</When>
    </>
  )

  return (
    <Card data-feed-update={update.id}>
      {user ? (
        <ProfileButton type="button" aria-label={name} onClick={openProfile}>
          <Avatar name={user.name} color={user.avatarColor} size={36} />
        </ProfileButton>
      ) : null}
      {plantHref ? <BodyLink to={plantHref}>{copy}</BodyLink> : <Body>{copy}</Body>}
    </Card>
  )
}
