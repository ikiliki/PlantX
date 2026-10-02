import { useMemo, useState } from 'react'
import { InfiniteSentinel, useInfiniteList } from '../../../../components/InfiniteScroll/InfiniteScroll'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { Plant, User } from '../../../../mock/types'
import { GreenhouseCard, greenhouseHref, greenhouseShelf } from '../GreenhouseCard/GreenhouseCard'
import { Empty, List, Root, Search } from './GreenhouseDirectory.styles'

function isGrower(user: User) {
  return user.role !== 'guest' && user.role !== 'admin'
}

function livingCount(plants: Plant[], ownerId: string) {
  return plants.filter((plant) => plant.ownerId === ownerId && (plant.status === 'owned' || plant.status === 'listed')).length
}

function matches(user: User, needle: string) {
  if (!needle) return true
  const blob = [user.name, user.nameHe, user.businessName, user.businessNameHe, user.bio, user.bioHe]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return blob.includes(needle)
}

export function GreenhouseDirectory() {
  const { db, currentUser } = useStore()
  const { t } = useI18n()
  const [query, setQuery] = useState('')

  const growers = useMemo(() => db.users.filter(isGrower), [db.users])
  const needle = query.trim().toLowerCase()
  const verifiedUsers = (db.verifiedGreenhouseIds ?? [])
    .map((id) => growers.find((user) => user.id === id))
    .filter((user): user is User => Boolean(user))
  const verifiedIds = new Set(verifiedUsers.map((user) => user.id))
  const rest = growers.filter((user) => !verifiedIds.has(user.id) && matches(user, needle))
  const list = useInfiniteList(rest, { signature: `${needle}|${rest.map((user) => user.id).join('|')}` })

  const card = (user: User, verified = false) => (
    <GreenhouseCard
      key={user.id}
      user={user}
      href={greenhouseHref(user.id, currentUser?.id)}
      plantCount={livingCount(db.plants, user.id)}
      photos={greenhouseShelf(db.plants, user.id)}
      verified={verified}
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
