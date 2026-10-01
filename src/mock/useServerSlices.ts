import { useEffect } from 'react'
import type { ServerSlice } from './liveApi'
import { useStore } from './store'

/** Load full rows for the slices this screen is showing. */
export function useServerSlices(parts: readonly ServerSlice[]) {
  const { loadSlice, liveStatus } = useStore()
  const key = parts.join(',')

  useEffect(() => {
    if (liveStatus !== 'up' || !key) return
    for (const part of key.split(',') as ServerSlice[]) void loadSlice(part)
  }, [key, liveStatus, loadSlice])
}
