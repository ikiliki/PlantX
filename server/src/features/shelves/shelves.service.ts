import { getStore } from '../../db/index.ts'
import { Errors } from '../../lib/errors.ts'
import type { Shelf } from '../../../../src/mock/types.ts'
import { greenhouseService } from '../greenhouse/greenhouse.service.ts'

export const SHELF_NAME_MAX = 40
export const SHELVES_MAX = 30

function cleanName(raw: unknown) {
  const name = typeof raw === 'string' ? raw.trim() : ''
  if (name.length < 1 || name.length > SHELF_NAME_MAX) throw Errors.invalid(`A shelf name is 1 to ${SHELF_NAME_MAX} characters`)
  return name
}

async function ownShelf(ownerId: string, shelfId: string): Promise<Shelf> {
  const shelf = (await getStore().shelves.list(ownerId)).find((item) => item.id === shelfId)
  if (!shelf) throw Errors.missing('Shelf not found')
  return shelf
}

/** A grower's shelves. Only the owner reads or changes them; a plant and its shelf always share an owner. */
export const shelvesService = {
  async mine(ownerId: string) {
    const store = getStore().shelves
    const [shelves, placements] = await Promise.all([store.list(ownerId), store.placements(ownerId)])
    return { shelves, placements }
  },

  async add(ownerId: string, rawName: unknown) {
    const name = cleanName(rawName)
    const shelves = await getStore().shelves.list(ownerId)
    if (shelves.length >= SHELVES_MAX) throw Errors.invalid(`Up to ${SHELVES_MAX} shelves`)
    return getStore().shelves.add(ownerId, name)
  },

  /** Rename and / or move to `position` (the rest renumber 0..n-1). */
  async update(ownerId: string, shelfId: string, patch: { name?: unknown; position?: unknown }) {
    const store = getStore().shelves
    await ownShelf(ownerId, shelfId)
    if (patch.name !== undefined) await store.rename(shelfId, cleanName(patch.name))
    if (patch.position !== undefined) {
      const position = Number(patch.position)
      if (!Number.isInteger(position) || position < 0) throw Errors.invalid('position must be a whole number')
      const order = (await store.list(ownerId)).map((shelf) => shelf.id).filter((id) => id !== shelfId)
      order.splice(Math.min(position, order.length), 0, shelfId)
      await store.reorder(ownerId, order)
    }
    return store.list(ownerId)
  },

  async remove(ownerId: string, shelfId: string) {
    await ownShelf(ownerId, shelfId)
    await getStore().shelves.remove(shelfId)
  },

  /** Puts one of your plants on one of your shelves, or takes it off (`null`). */
  async place(ownerId: string, plantId: string, shelfId: string | null) {
    const plant = await greenhouseService.get(plantId)
    if (plant.ownerId !== ownerId) throw Errors.forbidden('Plant is not yours')
    if (shelfId) await ownShelf(ownerId, shelfId).catch(() => {
      throw Errors.forbidden('Shelf is not yours')
    })
    return getStore().shelves.place(plantId, shelfId)
  },
}
