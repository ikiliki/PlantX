import { formatFeedTime } from '../../formatFeedTime'
import { useI18n } from '../../../../i18n/I18nProvider'
import { personaScenarioId } from '../../../../mock/personas'
import { useStore } from '../../../../mock/store'
import type { FeedUpdate as FeedUpdateData, FeedUpdateKind } from '../../../../mock/types'
import { Card, CardLink, Grower, Kind, Line, Meta, When } from './FeedUpdate.styles'

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
  const scenario = personaScenarioId(update.userId)
  const scenarioLabel = t.demo.personaScenarios[scenario]
  const href = update.plantId
    ? `/plants/${update.plantId}`
    : db.users.some((user) => user.id === update.userId)
      ? `/sellers/${update.userId}`
      : undefined

  const body = (
    <>
      <Meta>
        <Kind>{kindLabel(update.kind, t)}</Kind>
        <Grower>{scenarioLabel}</Grower>
      </Meta>
      <Line>{tr(update.body, update.bodyHe)}</Line>
      <When dateTime={update.createdAt}>{formatFeedTime(update.createdAt, locale, t.feed)}</When>
    </>
  )

  if (href) {
    return (
      <CardLink to={href} data-feed-update={update.id}>
        {body}
      </CardLink>
    )
  }

  return <Card data-feed-update={update.id}>{body}</Card>
}
