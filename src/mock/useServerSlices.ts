import { useEffect, useState } from 'react'
import { guestCanLoad, type ServerSlice } from './liveApi'
import { useStore } from './store'

/** Quick retries with growing waits (0.6 s, 1.2 s, 2.4 s, 4.8 s), then a slow retry until the API answers. */
const FAST_RETRIES = 4
const RETRY_MS = 600
const SLOW_RETRY_MS = 10_000

/**
 * Load full rows for the slices this screen is showing. Returns the slices still in flight (a failed one
 * stays in flight while it is retried). A guest only loads public slices; signing in changes the key.
 */
export function useServerSlices(parts: readonly ServerSlice[]) {
  const { loadSlice, liveWritable, liveStatus, signedIn } = useStore()
  const key = (signedIn ? parts : parts.filter(guestCanLoad)).join(',')
  const [done, setDone] = useState<ReadonlySet<ServerSlice>>(new Set())
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (liveStatus !== 'loading') return
    setDone(new Set())
    setAttempt(0)
  }, [liveStatus])

  useEffect(() => {
    if (!liveWritable || !key) return
    const requested = key.split(',') as ServerSlice[]
    const pending = requested.filter((part) => !done.has(part))
    if (pending.length === 0) return
    let cancel = false
    let retryTimer = 0
    void Promise.all(pending.map(async (part) => ({ part, ok: await loadSlice(part) }))).then((results) => {
      if (cancel) return
      const loaded = results.filter((item) => item.ok).map((item) => item.part)
      if (loaded.length > 0) {
        setDone((current) => {
          const next = new Set(current)
          for (const part of loaded) next.add(part)
          return next
        })
      }
      if (results.some((item) => !item.ok)) {
        // A dropped request (the API restarting, a flaky network) heals by itself: the screen keeps its
        // skeleton and tries again, never showing "empty" for data it could not read.
        const wait = attempt < FAST_RETRIES ? RETRY_MS * 2 ** attempt : SLOW_RETRY_MS
        retryTimer = window.setTimeout(() => {
          if (!cancel) setAttempt((value) => value + 1)
        }, wait)
      }
    })
    return () => {
      cancel = true
      window.clearTimeout(retryTimer)
    }
  }, [key, liveWritable, loadSlice, done, attempt])

  if (!liveWritable || !key) return new Set<ServerSlice>()
  return new Set((key.split(',') as ServerSlice[]).filter((part) => !done.has(part)))
}

/**
 * True while an open section is still waiting on its slices. A slice that failed counts as waiting (it is
 * being retried), so a member screen keeps its skeleton instead of deciding "empty" from missing data.
 * `settle`: admin sections treat a failed slice as settled, so they can show their unavailable notice.
 * Mock mode is already local, so it never waits.
 */
export function useSectionFetch(active: boolean, slices: readonly ServerSlice[], { settle = false }: { settle?: boolean } = {}) {
  const loading = useServerSlices(active ? slices : [])
  const { plantxEnv, liveStatus, sliceFailures } = useStore()
  if (!active || plantxEnv === 'mock' || liveStatus === 'down') return false
  if (liveStatus === 'loading') return true
  return slices.some((slice) => loading.has(slice) && (!settle || !sliceFailures[slice]))
}
