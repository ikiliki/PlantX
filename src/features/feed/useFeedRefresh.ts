import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '../../mock/store'

/** Coming back to the tab after this long refreshes the feed on its own. */
const STALE_MS = 2 * 60 * 1000
/** A refresh shows its spinner at least this long, so a fast answer still reads as "checked". */
const MIN_SPIN_MS = 600
/** How long "You're up to date" stays after a refresh. */
const DONE_MS = 3000

/**
 * The home feed's freshness: reload the feed slices on demand, remember when that happened, and refresh by
 * itself when the grower returns to a tab that has gone stale.
 */
export function useFeedRefresh() {
  const { reloadSlice } = useStore()
  const [refreshing, setRefreshing] = useState(false)
  const [updatedAt, setUpdatedAt] = useState(() => Date.now())
  const [justRefreshed, setJustRefreshed] = useState(false)
  const busy = useRef(false)
  const doneTimer = useRef(0)

  const refresh = useCallback(() => {
    if (busy.current) return
    busy.current = true
    setRefreshing(true)
    const minimum = new Promise((resolve) => window.setTimeout(resolve, MIN_SPIN_MS))
    void Promise.all([reloadSlice('updates'), reloadSlice('todos'), reloadSlice('plants'), minimum]).finally(() => {
      busy.current = false
      setRefreshing(false)
      setUpdatedAt(Date.now())
      setJustRefreshed(true)
      window.clearTimeout(doneTimer.current)
      doneTimer.current = window.setTimeout(() => setJustRefreshed(false), DONE_MS)
    })
  }, [reloadSlice])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - updatedAt > STALE_MS) refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refresh, updatedAt])

  useEffect(() => () => window.clearTimeout(doneTimer.current), [])

  return { refresh, refreshing, updatedAt, justRefreshed }
}

/** Minutes since `at`, re-read every half minute so "Updated 3 min ago" keeps moving. */
export function useMinutesSince(at: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [at])
  return Math.max(0, Math.floor((now - at) / 60_000))
}
