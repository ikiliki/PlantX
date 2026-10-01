import { useEffect, useState } from 'react'
import type { ServerSlice } from './liveApi'
import { useStore } from './store'

const RETRY_LIMIT = 2
const RETRY_MS = 600

/** Load full rows for the slices this screen is showing. Returns the slices still in flight. */
export function useServerSlices(parts: readonly ServerSlice[]) {
  const { loadSlice, liveWritable, liveStatus } = useStore()
  const key = parts.join(',')
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
      if (results.some((item) => !item.ok) && attempt < RETRY_LIMIT) {
        retryTimer = window.setTimeout(() => {
          if (!cancel) setAttempt((value) => value + 1)
        }, RETRY_MS)
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
 * True while an open section is still waiting on its slices.
 * A failed slice is settled, so the section can close on the unavailable notice.
 * Mock mode is already local, so it never waits.
 */
export function useSectionFetch(active: boolean, slices: readonly ServerSlice[]) {
  const loading = useServerSlices(active ? slices : [])
  const { plantxEnv, liveStatus, sliceFailures } = useStore()
  if (!active || plantxEnv === 'mock' || liveStatus === 'down') return false
  if (liveStatus === 'loading') return true
  return slices.some((slice) => loading.has(slice) && !sliceFailures[slice])
}
