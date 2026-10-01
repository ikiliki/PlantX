import type { Plant } from '../../../../src/mock/types.ts'
import { getStore } from '../../db/index.ts'
import { Errors } from '../../lib/errors.ts'
import { activityService } from '../activity/activity.service.ts'

function today() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Greenhouse plant state. Care actions update the plant, then record an activity
 * through the activity service (later: emit an event that activity listens to).
 */
export const greenhouseService = {
  async list() {
    return getStore().plants.list()
  },

  async get(plantId: string) {
    const plant = (await getStore().plants.list()).find((item) => item.id === plantId)
    if (!plant) throw Errors.missing(`Plant ${plantId} not found`)
    return plant
  },

  async add(plant: Plant, ownerId: string) {
    if (!plant.id || !plant.title) throw Errors.invalid('Plant id and title are required')
    const store = getStore()
    const plants = await store.plants.list()
    const row = { ...plant, ownerId }
    plants.unshift(row)
    await store.plants.saveAll(plants)
    return row
  },

  async water(plantId: string, userId: string) {
    const store = getStore()
    const plants = await store.plants.list()
    const plant = plants.find((item) => item.id === plantId && item.ownerId === userId)
    if (!plant) throw Errors.missing(`Plant ${plantId} not found for owner`)
    const at = today()
    plant.wateredAt = at
    plant.history = [{ at, label: 'Watered', labelHe: 'הושקה' }, ...plant.history]
    await store.plants.saveAll(plants)
    const activity = await activityService.record({
      kind: 'water',
      userId,
      plantId: plant.id,
      body: `Water confirmed on ${plant.title}.`,
      bodyHe: `השקיה אושרה ל־${plant.titleHe}.`,
    })
    return { plant, activity }
  },

  async refreshPhoto(plantId: string, userId: string) {
    const store = getStore()
    const plants = await store.plants.list()
    const plant = plants.find((item) => item.id === plantId && item.ownerId === userId)
    if (!plant) throw Errors.missing(`Plant ${plantId} not found for owner`)
    const at = today()
    plant.photoAt = at
    plant.history = [{ at, label: 'Photo refreshed', labelHe: 'התמונה רועננה' }, ...plant.history]
    await store.plants.saveAll(plants)
    const activity = await activityService.record({
      kind: 'photo',
      userId,
      plantId: plant.id,
      body: `${plant.title} photo refreshed.`,
      bodyHe: `תמונת ${plant.titleHe} רועננה.`,
    })
    return { plant, activity }
  },
}
