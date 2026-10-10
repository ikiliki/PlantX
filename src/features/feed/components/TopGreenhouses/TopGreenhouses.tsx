import { SkeletonBar } from '../../../../components/Skeleton/Skeleton'
import { HeadLink, HeadTitle, Section } from '../../../discover/components/HomeToday/HomeToday.styles'
import {
  GreenhouseCard,
  GreenhouseCardSkeleton,
  greenhouseHref,
  greenhouseShelf,
} from '../../../greenhouse/components/GreenhouseCard/GreenhouseCard'
import { isPublicGreenhouse } from '../../../greenhouse/components/GreenhouseDirectory/GreenhouseDirectory'
import { useGreenhouseLevelsState } from '../../../greenhouse/useGreenhouseLevels'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { useSectionFetch } from '../../../../mock/useServerSlices'
import type { Plant, User } from '../../../../mock/types'
import { Heading, List, Panel, Strip } from './TopGreenhouses.styles'

const TOP = 3

function livingCount(plants: Plant[], ownerId: string) {
  return plants.filter((plant) => plant.ownerId === ownerId && (plant.status === 'owned' || plant.status === 'listed')).length
}

/**
 * The top three greenhouses by XP (other growers', with plants), then the verified greenhouses; nothing when
 * neither has any. `strip` (the daily Home): one sideways row of the Global cards with a link to all greenhouses.
 * Otherwise (the desktop rail): two compact lists. Skeletons while levels load.
 */
export function TopGreenhouses({ strip = false }: { strip?: boolean }) {
  const { t } = useI18n()
  const { db, currentUser } = useStore()
  const { levels, ready } = useGreenhouseLevelsState()
  const waiting = useSectionFetch(Boolean(currentUser), ['users', 'plants']) || !ready
  const verifiedIds = db.verifiedGreenhouseIds ?? []

  if (waiting) {
    return strip ? (
      <Section aria-busy data-top-greenhouses-loading>
        <SkeletonBar width="40%" height={18} />
        <Strip>
          <GreenhouseCardSkeleton />
          <GreenhouseCardSkeleton />
        </Strip>
      </Section>
    ) : (
      <Panel aria-busy data-top-greenhouses-loading>
        <SkeletonBar width="40%" height={16} />
        <SkeletonBar height={64} />
        <SkeletonBar height={64} />
      </Panel>
    )
  }

  const card = (user: User, verified: boolean) => (
    <GreenhouseCard
      key={user.id}
      user={user}
      href={greenhouseHref(user.id, currentUser?.id)}
      plantCount={livingCount(db.plants, user.id)}
      photos={greenhouseShelf(db.plants, user.id)}
      verified={verified}
      level={strip ? levels[user.id] : undefined}
      compact={!strip}
    />
  )

  const top = db.users
    .filter((user) => user.id !== currentUser?.id && isPublicGreenhouse(user, currentUser) && livingCount(db.plants, user.id) > 0)
    .sort(
      (a, b) =>
        (levels[b.id]?.xp ?? 0) - (levels[a.id]?.xp ?? 0) ||
        livingCount(db.plants, b.id) - livingCount(db.plants, a.id) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, TOP)
  const verified = verifiedIds
    .map((id) => db.users.find((user) => user.id === id && isPublicGreenhouse(user, currentUser)))
    .filter((user): user is User => Boolean(user))

  if (top.length === 0 && verified.length === 0) return null

  if (strip) {
    // One row: the top three, then the verified ones not already among them.
    const extra = verified.filter((user) => !top.some((item) => item.id === user.id))
    return (
      <Section aria-label={t.feed.topGreenhouses} data-top-greenhouses>
        <HeadLink to="/greenhouse?scope=global">
          <HeadTitle>{t.feed.topGreenhouses}</HeadTitle>
        </HeadLink>
        <Strip>
          {top.map((user) => card(user, verifiedIds.includes(user.id)))}
          {extra.map((user) => card(user, true))}
        </Strip>
      </Section>
    )
  }

  return (
    <>
      {top.length > 0 ? (
        <Panel aria-label={t.feed.topGreenhouses} data-top-greenhouses>
          <Heading>{t.feed.topGreenhouses}</Heading>
          <List>{top.map((user) => card(user, verifiedIds.includes(user.id)))}</List>
        </Panel>
      ) : null}
      {verified.length > 0 ? (
        <Panel aria-label={t.greenhouse.verified} data-verified-greenhouses>
          <Heading>{t.greenhouse.verified}</Heading>
          <List>{verified.map((user) => card(user, true))}</List>
        </Panel>
      ) : null}
    </>
  )
}
