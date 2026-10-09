import { useMemo, useState } from 'react'
import { EmptyState } from '../../../../components/EmptyState/EmptyState'
import { Icon } from '../../../../components/Icon/Icon'
import { InfiniteSentinel, useInfiniteList } from '../../../../components/InfiniteScroll/InfiniteScroll'
import { SkeletonBar } from '../../../../components/Skeleton/Skeleton'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { User } from '../../../../mock/types'
import { useSectionFetch } from '../../../../mock/useServerSlices'
import {
  DIRECTORY_SORTS,
  directoryComparator,
  lastPlantAt,
  livingCounts,
  matchesGrower,
  sameRegion,
  type DirectorySort,
} from '../../greenhouseDirectory'
import { useGreenhouseLevelsState } from '../../useGreenhouseLevels'
import { GreenhouseCard, GreenhouseCardSkeleton, greenhouseHref, greenhouseShelf } from '../GreenhouseCard/GreenhouseCard'
import {
  Controls,
  Grid,
  Head,
  Lead,
  NearChip,
  Root,
  Search,
  SearchField,
  SectionTitle,
  Sort,
  SortOption,
  Stats,
  Title,
} from './GreenhouseDirectory.styles'

/**
 * A greenhouse in the Global list. A grower does not see their own there (it is the Mine tab);
 * the admin is left out of everyone else's list, and sees every greenhouse including his own.
 */
export function isPublicGreenhouse(user: User, viewer: User | null) {
  if (user.role === 'guest') return false
  if ((user.accountStatus ?? 'active') === 'disabled') return false
  if (user.role === 'admin') return viewer?.role === 'admin'
  if (viewer && viewer.role !== 'admin' && user.id === viewer.id) return false
  return true
}

/**
 * Whether `/greenhouse/:ownerId` opens for this viewer. Unlike the Global list, your own greenhouse opens too:
 * every greenhouse link (a passport's greenhouse row included) leads to the public page (#84).
 */
export function canOpenGreenhouse(user: User, viewer: User | null) {
  if (viewer && user.id === viewer.id) return user.role !== 'guest'
  return isPublicGreenhouse(user, viewer)
}

const SKELETON_CARDS = 6

function DirectoryHead({ growers, plants }: { growers?: number; plants?: number }) {
  const { t } = useI18n()
  return (
    <Head>
      <Title>{t.greenhouse.directoryTitle}</Title>
      <Lead>{t.greenhouse.directoryLead}</Lead>
      {growers === undefined || plants === undefined ? (
        <SkeletonBar width="160px" height={14} />
      ) : (
        <Stats>
          {t.greenhouse.directoryStats
            .replace('{growers}', growers.toLocaleString())
            .replace('{plants}', plants.toLocaleString())}
        </Stats>
      )}
    </Head>
  )
}

/** The directory's layout with placeholder cards: loading for a member, behind the guest's log-in card. */
export function GreenhouseDirectorySkeleton() {
  const { t } = useI18n()
  return (
    <Root aria-hidden>
      <DirectoryHead />
      <Controls>
        <SearchField>
          <Icon name="search" size={18} />
          <Search type="search" disabled placeholder={t.greenhouse.directorySearch} tabIndex={-1} />
        </SearchField>
      </Controls>
      <Grid>
        {Array.from({ length: SKELETON_CARDS }, (_, index) => (
          <GreenhouseCardSkeleton key={index} />
        ))}
      </Grid>
    </Root>
  )
}

export function GreenhouseDirectory() {
  const { db, currentUser } = useStore()
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<DirectorySort>('level')
  const [near, setNear] = useState(false)
  // Only what these cards show: the growers, their plant photos and their levels (#77).
  const listLoading = useSectionFetch(true, ['users', 'plants'])
  const { levels, ready: levelsReady } = useGreenhouseLevelsState()
  const counts = useMemo(() => livingCounts(db.plants), [db.plants])
  const latest = useMemo(() => lastPlantAt(db.plants), [db.plants])
  const growers = useMemo(
    () => db.users.filter((user) => isPublicGreenhouse(user, currentUser)),
    [db.users, currentUser],
  )
  const canNear = Boolean(currentUser?.region?.trim()) && growers.some((user) => sameRegion(user, currentUser))
  const order = directoryComparator(sort, levels, counts, latest)
  const needle = query.trim().toLowerCase()
  const keep = (user: User) => matchesGrower(user, needle) && (!near || sameRegion(user, currentUser))

  const verifiedUsers = (db.verifiedGreenhouseIds ?? [])
    .map((id) => growers.find((user) => user.id === id))
    .filter((user): user is User => Boolean(user))
    .filter(keep)
    .sort(order)
  const verifiedIds = new Set(verifiedUsers.map((user) => user.id))
  // Greenhouses with no plants stay out of the list unless a search names them (#20).
  const rest = growers
    .filter((user) => !verifiedIds.has(user.id) && keep(user))
    .filter((user) => Boolean(needle) || (counts[user.id] ?? 0) > 0)
    .sort(order)
  const list = useInfiniteList(rest, { signature: `${sort}|${near}|${needle}|${rest.map((user) => user.id).join('|')}` })
  const shownGrowers = growers.filter((user) => (counts[user.id] ?? 0) > 0)
  const shownPlants = shownGrowers.reduce((sum, user) => sum + (counts[user.id] ?? 0), 0)

  const card = (user: User, verified = false) => (
    <GreenhouseCard
      key={user.id}
      user={user}
      href={greenhouseHref(user.id, currentUser?.id)}
      plantCount={counts[user.id] ?? 0}
      photos={greenhouseShelf(db.plants, user.id)}
      verified={verified}
      level={levels[user.id]}
    />
  )

  // Placeholders until the cards can render whole: no empty-state flash, no level rings popping in later.
  if (listLoading || !levelsReady) return <GreenhouseDirectorySkeleton />

  const sortLabel = { level: t.greenhouse.sortLevel, plants: t.greenhouse.sortPlants, recent: t.greenhouse.sortRecent }

  return (
    <Root>
      <DirectoryHead growers={shownGrowers.length} plants={shownPlants} />
      <Controls>
        <SearchField>
          <Icon name="search" size={18} />
          <Search
            type="search"
            value={query}
            placeholder={t.greenhouse.directorySearch}
            aria-label={t.greenhouse.directorySearch}
            onChange={(event) => setQuery(event.target.value)}
          />
        </SearchField>
        <Sort role="radiogroup" aria-label={t.greenhouse.sortLabel}>
          {DIRECTORY_SORTS.map((id) => (
            <SortOption
              key={id}
              type="button"
              role="radio"
              aria-checked={sort === id}
              $on={sort === id}
              onClick={() => setSort(id)}
            >
              {sortLabel[id]}
            </SortOption>
          ))}
          {canNear ? (
            <NearChip type="button" aria-pressed={near} $on={near} onClick={() => setNear((value) => !value)}>
              <Icon name="pin" size={15} />
              {t.greenhouse.nearMe}
            </NearChip>
          ) : null}
        </Sort>
      </Controls>

      {verifiedUsers.length > 0 && (
        <section aria-label={t.greenhouse.verified}>
          <SectionTitle>{t.greenhouse.verified}</SectionTitle>
          <Grid>{verifiedUsers.map((user) => card(user, true))}</Grid>
        </section>
      )}
      {list.total === 0 && verifiedUsers.length === 0 ? (
        <EmptyState icon="globe" title={t.greenhouse.directoryEmpty} />
      ) : list.total > 0 ? (
        <Grid>
          {list.shown.map((user) => card(user))}
          <InfiniteSentinel hasMore={list.hasMore} onLoadMore={list.loadMore} tick={list.shown.length} />
        </Grid>
      ) : null}
    </Root>
  )
}
