import { useEffect, useMemo, useRef, useState } from 'react'
import { FEED_PAGE_SIZE } from '../../mock/projectDb'
import { useStore } from '../../mock/store'
import type { FeedUpdate } from '../../mock/types'

export type HomeFeedItem = { type: 'update'; id: string; at: string; update: FeedUpdate }

function friendCircle(userId: string | undefined, friendIds: string[] | undefined) {
  return new Set([userId, ...(friendIds ?? [])].filter(Boolean) as string[])
}

/** Newest-first greenhouse activities. Global, or friends when filtered. AI scans stay in the owner's greenhouse. */
export function useHomeFeed(options?: { paged?: boolean }) {
  const { db, currentUser, signedIn } = useStore()
  const friendsOnly = Boolean(db.feedFriendsOnly && signedIn)
  const paging = options?.paged !== false
  const items = useMemo(() => {
    const allowed = friendCircle(currentUser?.id, currentUser?.friendIds)
    return (db.updates ?? [])
      .filter((update) => update.kind !== 'scan' && (!friendsOnly || allowed.has(update.userId)))
      .map((update) => ({
        type: 'update' as const,
        id: update.id,
        at: update.createdAt,
        update,
      }))
      .sort((a, b) => b.at.localeCompare(a.at))
  }, [currentUser, db.updates, friendsOnly])

  const [count, setCount] = useState(FEED_PAGE_SIZE)
  const signature = `${paging}:${items.map((item) => item.id).join('|')}`

  useEffect(() => {
    setCount(paging ? FEED_PAGE_SIZE : items.length)
  }, [paging, signature, items.length])

  const visible = paging ? items.slice(0, count) : items
  const hasMore = paging && count < items.length
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setCount((current) => Math.min(current + FEED_PAGE_SIZE, items.length))
      },
      { rootMargin: '280px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, items.length])

  return { items: visible, hasMore, sentinelRef, friendsOnly }
}
