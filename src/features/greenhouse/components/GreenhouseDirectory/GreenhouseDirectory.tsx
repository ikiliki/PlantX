import { useMemo, useState } from 'react'
import { InfiniteSentinel, useInfiniteList } from '../../../../components/InfiniteScroll/InfiniteScroll'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { Plant, User } from '../../../../mock/types'
import { useGreenhouseLevels } from '../../useGreenhouseLevels'
import { GreenhouseCard, GreenhouseCardSkeleton, greenhouseHref, greenhouseShelf } from '../GreenhouseCard/GreenhouseCard'
import { Empty, List, Root, Search } from './GreenhouseDirectory.styles'

/**
 * A public greenhouse. Every grower is listed for everyone.
 * The admin is left out of that list, and sees every greenhouse including his own.
 */
export function isPublicGreenhouse(user: User, viewer: User | null) {
  if (user.role === 'guest') return false
  if ((user.accountStatus ?? 'active') === 'disabled') return false
  if (user.role === 'admin') return viewer?.role === 'admin'
  return true
}

function livingCount(plants: Plant[], ownerId: string) {
  return plants.filter((plant) => plant.ownerId === ownerId && (plant.status === 'owned' || plant.status === 'listed')).length
}

function matches(user: User, needle: string) {
  if (!needle) return true
  const blob = [
    user.nickname?.trim() ? user.nickname : user.name,
    user.nickname?.trim() ? '' : user.nameHe,
    user.businessName,
    user.businessNameHe,
    user.bio,
    user.bioHe,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return blob.includes(needle)
}

const SKELETON_ROWS = 6

/** The directory's layout with placeholder rows: loading for a member, behind the guest's log-in card. */
export function GreenhouseDirectorySkeleton() {
  const { t } = useI18n()
  return (
    <Root aria-hidden>
      <Search type="search" disabled placeholder={t.greenhouse.directorySearch} tabIndex={-1} />
      <List>
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <GreenhouseCardSkeleton key={index} />
        ))}
      </List>
    </Root>
  )
}

export function GreenhouseDirectory() {
  const { db, currentUser } = useStore()
  const { t } = useI18n()
  const [query, setQuery] = useState('')

  const levels = useGreenhouseLevels()
  const growers = useMemo(
    () => db.users.filter((user) => isPublicGreenhouse(user, currentUser)),
    [db.users, currentUser],
  )
  // Highest level first; XP breaks ties inside a level, then the name keeps the order stable.
  const byLevel = (a: User, b: User) =>
    (levels[b.id]?.level ?? 0) - (levels[a.id]?.level ?? 0) ||
    (levels[b.id]?.xp ?? 0) - (levels[a.id]?.xp ?? 0) ||
    a.name.localeCompare(b.name)
  const needle = query.trim().toLowerCase()
  const verifiedUsers = (db.verifiedGreenhouseIds ?? [])
    .map((id) => growers.find((user) => user.id === id))
    .filter((user): user is User => Boolean(user))
    .sort(byLevel)
  const verifiedIds = new Set(verifiedUsers.map((user) => user.id))
  const rest = growers.filter((user) => !verifiedIds.has(user.id) && matches(user, needle)).sort(byLevel)
  const list = useInfiniteList(rest, { signature: `${needle}|${rest.map((user) => user.id).join('|')}` })

  const card = (user: User, verified = false) => (
    <GreenhouseCard
      key={user.id}
      user={user}
      href={greenhouseHref(user.id, currentUser?.id)}
      plantCount={livingCount(db.plants, user.id)}
      photos={greenhouseShelf(db.plants, user.id)}
      verified={verified}
      level={levels[user.id]}
    />
  )

  return (
    <Root>
      <Search
        type="search"
        value={query}
        placeholder={t.greenhouse.directorySearch}
        aria-label={t.greenhouse.directorySearch}
        onChange={(event) => setQuery(event.target.value)}
      />
      {verifiedUsers.length > 0 && (
        <List aria-label={t.greenhouse.verified}>{verifiedUsers.map((user) => card(user, true))}</List>
      )}
      {list.total === 0 && verifiedUsers.length === 0 ? (
        <Empty>{t.greenhouse.directoryEmpty}</Empty>
      ) : list.total > 0 ? (
        <List>
          {list.shown.map((user) => card(user))}
          <InfiniteSentinel hasMore={list.hasMore} onLoadMore={list.loadMore} tick={list.shown.length} />
        </List>
      ) : null}
    </Root>
  )
}
