import { SkeletonBar } from '../../../../components/Skeleton/Skeleton'
import { GreenhouseCard, greenhouseHref, greenhouseShelf } from '../../../greenhouse/components/GreenhouseCard/GreenhouseCard'
import { isPublicGreenhouse } from '../../../greenhouse/components/GreenhouseDirectory/GreenhouseDirectory'
import { useGreenhouseLevelsState } from '../../../greenhouse/useGreenhouseLevels'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { useSectionFetch } from '../../../../mock/useServerSlices'
import type { Plant, User } from '../../../../mock/types'
import { Heading, List, Panel } from './TopGreenhouses.styles'

const TOP = 3

function livingCount(plants: Plant[], ownerId: string) {
  return plants.filter((plant) => plant.ownerId === ownerId && (plant.status === 'owned' || plant.status === 'listed')).length
}

/**
 * Home: the top three greenhouses by XP (other growers', with plants), then the verified greenhouses.
 * Each list shows only when it has greenhouses; nothing at all when neither does. Skeletons while levels load.
 */
export function TopGreenhouses() {
  const { t } = useI18n()
  const { db, currentUser } = useStore()
  const { levels, ready } = useGreenhouseLevelsState()
  const waiting = useSectionFetch(Boolean(currentUser), ['users', 'plants']) || !ready

  if (waiting) {
    return (
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
      compact
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
  const verified = (db.verifiedGreenhouseIds ?? [])
    .map((id) => db.users.find((user) => user.id === id && isPublicGreenhouse(user, currentUser)))
    .filter((user): user is User => Boolean(user))

  if (top.length === 0 && verified.length === 0) return null

  return (
    <>
      {top.length > 0 ? (
        <Panel aria-label={t.feed.topGreenhouses} data-top-greenhouses>
          <Heading>{t.feed.topGreenhouses}</Heading>
          <List>{top.map((user) => card(user, (db.verifiedGreenhouseIds ?? []).includes(user.id)))}</List>
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
