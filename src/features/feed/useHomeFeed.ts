import { useMemo } from 'react'
import { useStore } from '../../mock/store'
import type { FeedUpdate } from '../../mock/types'

export type HomeFeedItem = { type: 'update'; id: string; at: string; update: FeedUpdate }

/** Newest-first activity from every greenhouse. */
export function useHomeFeed() {
  const { db } = useStore()
  const items = useMemo(
    () =>
      (db.updates ?? [])
        .map((update) => ({
          type: 'update' as const,
          id: update.id,
          at: update.createdAt,
          update,
        }))
        .sort((a, b) => b.at.localeCompare(a.at)),
    [db.updates],
  )

  return { items }
}
