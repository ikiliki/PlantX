import { useCallback, useState } from 'react'

export type ShelfView = 'grid' | 'shelves'

const KEY = 'plantx.greenhouse.view'

function read(): ShelfView {
  try {
    return localStorage.getItem(KEY) === 'shelves' ? 'shelves' : 'grid'
  } catch {
    return 'grid'
  }
}

/** Grid or Shelves on your own greenhouse, remembered on this device. */
export function useShelfView() {
  const [view, setViewState] = useState<ShelfView>(read)
  const setView = useCallback((next: ShelfView) => {
    setViewState(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // Private windows can refuse storage; the choice still holds for this visit.
    }
  }, [])
  return { view, setView }
}
