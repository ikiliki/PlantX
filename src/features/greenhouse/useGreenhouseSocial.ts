import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { fetchMySocial } from '../../mock/liveApi'
import { useStore } from '../../mock/store'
import type { GreenhouseSocialItem } from '../../mock/types'
import type { ActivityEntry } from './components/ActivityThread/ActivityThread'

const COMMENT_PREVIEW = 80
const SEEN_KEY = 'plantx.social.seen.'

/** When this browser last opened Social (or the bell) for this grower; newer items from others are unread. */
const seenListeners = new Set<() => void>()

function readSeen(userId: string) {
  try {
    return localStorage.getItem(SEEN_KEY + userId) ?? ''
  } catch {
    return ''
  }
}

function writeSeen(userId: string, iso: string) {
  try {
    localStorage.setItem(SEEN_KEY + userId, iso)
  } catch {
    // Private windows can refuse storage; the count clears for this visit only.
  }
  seenListeners.forEach((listener) => listener())
}

function subscribeSeen(listener: () => void) {
  seenListeners.add(listener)
  return () => {
    seenListeners.delete(listener)
  }
}

/** Shared between the bell and the thread, so one fetch serves both while a page is open. */
let cache: { userId: string; items: GreenhouseSocialItem[] } | null = null
let inflight: Promise<void> | null = null
const itemListeners = new Set<() => void>()

function loadItems(userId: string, force = false) {
  if (!force && cache?.userId === userId) return Promise.resolve()
  if (inflight) return inflight
  inflight = fetchMySocial()
    .then((res) => {
      cache = { userId, items: res?.items ?? [] }
      itemListeners.forEach((listener) => listener())
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}

/**
 * Greenhouse activities → Social: every 🌿 and comment on your posts (yours too, as "You …"), as activity rows
 * with the post's plant, who did it, and when. `unread` counts other growers' ones since you last looked;
 * `markSeen` clears it. Live server only; mock mode has none.
 */
export function useGreenhouseSocial(active: boolean) {
  const { t, tr } = useI18n()
  const { db, liveWritable, signedIn, currentUser } = useStore()
  const userId = signedIn && currentUser ? currentUser.id : ''
  const [, rerender] = useState(0)
  const [loading, setLoading] = useState(false)
  const seen = useSyncExternalStore(subscribeSeen, () => (userId ? readSeen(userId) : ''))

  useEffect(() => {
    const listener = () => rerender((value) => value + 1)
    itemListeners.add(listener)
    return () => {
      itemListeners.delete(listener)
    }
  }, [])

  useEffect(() => {
    if (!active || !userId || !liveWritable) return
    setLoading(true)
    void loadItems(userId, true).finally(() => setLoading(false))
  }, [active, userId, liveWritable])

  const items = cache && cache.userId === userId ? cache.items : []

  const entries = useMemo(
    () =>
      items.map((item): ActivityEntry => {
        const plant = item.plantId ? db.plants.find((row) => row.id === item.plantId) : undefined
        const mine = item.userId === userId
        const name = item.userName || item.userId
        const text = item.body.length > COMMENT_PREVIEW ? `${item.body.slice(0, COMMENT_PREVIEW)}…` : item.body
        const label =
          item.kind === 'comment'
            ? (mine ? t.greenhouse.socialYouCommented : t.greenhouse.socialCommented)
                .replace('{name}', name)
                .replace('{text}', text)
            : mine
              ? t.greenhouse.socialYouReacted
              : t.greenhouse.socialReacted.replace('{name}', name)
        return {
          at: item.createdAt,
          plant: plant ? tr(plant.title, plant.titleHe) : t.greenhouse.activitySocial,
          plantId: plant?.id,
          photo: plant?.photos[0],
          label,
          social: item.kind,
          updateId: item.activityId,
        }
      }),
    [items, db.plants, t, tr, userId],
  )

  const unread = items.filter((item) => item.userId !== userId && item.createdAt > seen).length

  const markSeen = useCallback(() => {
    if (!userId) return
    const newest = items.reduce((max, item) => (item.createdAt > max ? item.createdAt : max), seen)
    if (newest && newest !== seen) writeSeen(userId, newest)
  }, [items, seen, userId])

  return { entries, loading, unread, markSeen }
}
