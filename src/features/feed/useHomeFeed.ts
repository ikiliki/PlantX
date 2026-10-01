import { useMemo } from 'react'
import { useStore } from '../../mock/store'
import type { FeedUpdate } from '../../mock/types'

export type HomeFeedItem = { type: 'update'; id: string; at: string; update: FeedUpdate }

function friendCircle(userId: string | undefined, friendIds: string[] | undefined) {
  return new Set([userId, ...(friendIds ?? [])].filter(Boolean) as string[])
}

/** Newest-first activity from every greenhouse. Friends narrows the list; every kind stays in. */
export function useHomeFeed() {
  const { db, currentUser, signedIn } = useStore()
  const friendsOnly = Boolean(db.feedFriendsOnly && signedIn)
  const items = useMemo(() => {
    const allowed = friendCircle(currentUser?.id, currentUser?.friendIds)
    return (db.updates ?? [])
      .filter((update) => !friendsOnly || allowed.has(update.userId))
      .map((update) => ({
        type: 'update' as const,
        id: update.id,
        at: update.createdAt,
        update,
      }))
      .sort((a, b) => b.at.localeCompare(a.at))
  }, [currentUser, db.updates, friendsOnly])

  return { items, friendsOnly }
}
