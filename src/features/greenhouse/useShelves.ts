import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { deleteShelf, fetchShelves, patchShelf, postShelf, putPlantShelf } from '../../mock/liveApi'
import { useStore } from '../../mock/store'
import type { Shelf, ShelfPlacement } from '../../mock/types'

export const SHELF_NAME_MAX = 40

type State = { ownerId: string | null; shelves: Shelf[]; placements: ShelfPlacement[]; loaded: boolean }

/**
 * The signed-in grower's shelves, shared by the greenhouse board and the passport's shelf select.
 * Live: loaded from `/api/shelves` and written through it. Mock mode: kept in memory for the session.
 */
let state: State = { ownerId: null, shelves: [], placements: [], loaded: false }
const listeners = new Set<() => void>()

function set(next: Partial<State>) {
  state = { ...state, ...next }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function cleanShelfName(raw: string) {
  const name = raw.trim()
  return name.length >= 1 && name.length <= SHELF_NAME_MAX ? name : null
}

export function useShelves() {
  const { currentUser, liveWritable } = useStore()
  const ownerId = currentUser?.id ?? null
  const snapshot = useSyncExternalStore(subscribe, () => state)

  useEffect(() => {
    if (!ownerId) return
    if (state.ownerId === ownerId && state.loaded) return
    set({ ownerId, shelves: [], placements: [], loaded: !liveWritable })
    if (!liveWritable) return
    void fetchShelves().then((res) => {
      if (state.ownerId !== ownerId) return
      set({ shelves: res?.shelves ?? [], placements: res?.placements ?? [], loaded: true })
    })
  }, [ownerId, liveWritable])

  const addShelf = useCallback(
    async (raw: string) => {
      const name = cleanShelfName(raw)
      if (!name || !ownerId) return false
      if (!liveWritable) {
        set({ shelves: [...state.shelves, { id: `shelf-${Date.now()}`, ownerId, name, position: state.shelves.length }] })
        return true
      }
      const res = await postShelf(name)
      if (!res) return false
      set({ shelves: [...state.shelves, res.shelf] })
      return true
    },
    [liveWritable, ownerId],
  )

  const renameShelf = useCallback(
    async (id: string, raw: string) => {
      const name = cleanShelfName(raw)
      if (!name) return false
      const previous = state.shelves
      set({ shelves: state.shelves.map((shelf) => (shelf.id === id ? { ...shelf, name } : shelf)) })
      if (!liveWritable) return true
      const res = await patchShelf(id, { name })
      if (!res) set({ shelves: previous })
      return Boolean(res)
    },
    [liveWritable],
  )

  /** Moves a shelf to `position`; the rest close up around it. */
  const moveShelf = useCallback(
    async (id: string, position: number) => {
      const previous = state.shelves
      const order = previous.filter((shelf) => shelf.id !== id)
      const moving = previous.find((shelf) => shelf.id === id)
      if (!moving) return false
      order.splice(Math.max(0, Math.min(position, order.length)), 0, moving)
      set({ shelves: order.map((shelf, index) => ({ ...shelf, position: index })) })
      if (!liveWritable) return true
      const res = await patchShelf(id, { position })
      if (res) set({ shelves: res.shelves })
      else set({ shelves: previous })
      return Boolean(res)
    },
    [liveWritable],
  )

  /** The shelf goes; its plants stay in the greenhouse, "Not on a shelf". */
  const removeShelf = useCallback(
    async (id: string) => {
      const previous = { shelves: state.shelves, placements: state.placements }
      set({
        shelves: state.shelves.filter((shelf) => shelf.id !== id),
        placements: state.placements.filter((placement) => placement.shelfId !== id),
      })
      if (!liveWritable) return true
      const res = await deleteShelf(id)
      if (!res) set(previous)
      return Boolean(res)
    },
    [liveWritable],
  )

  const placePlant = useCallback(
    async (plantId: string, shelfId: string | null) => {
      const previous = state.placements
      const others = previous.filter((placement) => placement.plantId !== plantId)
      const position = previous.filter((placement) => placement.shelfId === shelfId).length
      set({ placements: shelfId ? [...others, { plantId, shelfId, position }] : others })
      if (!liveWritable) return true
      const res = await putPlantShelf(plantId, shelfId)
      if (!res) set({ placements: previous })
      return Boolean(res)
    },
    [liveWritable],
  )

  const shelfOf = useCallback(
    (plantId: string) => snapshot.placements.find((placement) => placement.plantId === plantId)?.shelfId ?? null,
    [snapshot.placements],
  )

  return {
    shelves: snapshot.ownerId === ownerId ? [...snapshot.shelves].sort((a, b) => a.position - b.position) : [],
    placements: snapshot.ownerId === ownerId ? snapshot.placements : [],
    loaded: snapshot.ownerId === ownerId && snapshot.loaded,
    shelfOf,
    addShelf,
    renameShelf,
    moveShelf,
    removeShelf,
    placePlant,
  }
}
