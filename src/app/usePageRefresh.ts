import { useCallback, useRef, useState } from 'react'
import { guestCanLoad } from '../mock/liveApi'
import { useStore } from '../mock/store'
import { isPlacementReady } from '../theme/release'
import { refreshablePage } from './pageRefresh'

/** A pull shows its spinner at least this long, so a fast answer still reads as "checked". */
const MIN_SPIN_MS = 600

/**
 * Pull to refresh for the page at `pathname`. An open page refetches only its own slices (no loader flash).
 * A page that is still gated (coming soon, maintenance) reloads everything, system config included, so a
 * launch shows on the next pull. A guest only refetches what a guest may load.
 */
export function usePageRefresh(pathname: string) {
  const { db, signedIn, reloadSlice, retryLive } = useStore()
  const [refreshing, setRefreshing] = useState(false)
  const busy = useRef(false)
  const page = refreshablePage(pathname)

  const refresh = useCallback(() => {
    if (!page || busy.current) return
    busy.current = true
    setRefreshing(true)
    const open = db.system.pages[page.pageId] === 'live' && isPlacementReady(db.system, page.board)
    const slices = signedIn ? page.slices : page.slices.filter(guestCanLoad)
    const work = open ? Promise.all(slices.map((slice) => reloadSlice(slice))) : retryLive()
    const minimum = new Promise((resolve) => window.setTimeout(resolve, MIN_SPIN_MS))
    void Promise.all([work, minimum]).finally(() => {
      busy.current = false
      setRefreshing(false)
    })
  }, [page, db.system, signedIn, reloadSlice, retryLive])

  return { available: page !== null, refreshing, refresh }
}
