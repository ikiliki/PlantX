import { useEffect, useState } from 'react'
import type { ServerSlice } from './liveApi'
import { useStore } from './store'

/** Load full rows for the slices this screen is showing. Returns the slices still in flight. */
export function useServerSlices(parts: readonly ServerSlice[]) {
  const { loadSlice, liveWritable } = useStore()
  const key = parts.join(',')
  const [done, setDone] = useState<ReadonlySet<ServerSlice>>(new Set())

  useEffect(() => {
    if (!liveWritable || !key) return
    const requested = key.split(',') as ServerSlice[]
    const pending = requested.filter((part) => !done.has(part))
    if (pending.length === 0) return
    let cancel = false
    void Promise.all(pending.map((part) => loadSlice(part))).finally(() => {
      if (cancel) return
      setDone((current) => {
        const next = new Set(current)
        for (const part of pending) next.add(part)
        return next
      })
    })
    return () => {
      cancel = true
    }
  }, [key, liveWritable, loadSlice, done])

  if (!liveWritable || !key) return new Set<ServerSlice>()
  return new Set((key.split(',') as ServerSlice[]).filter((part) => !done.has(part)))
}
