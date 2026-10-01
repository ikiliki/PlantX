import type { Plant } from '../../../../src/mock/types.ts'
import { Errors } from '../../lib/errors.ts'
import { readJson, writeJson } from '../../lib/jsonStore.ts'
import { activityService } from '../activity/activity.service.ts'

function loadPlants() {
  return readJson<Plant[]>('plants.json', [])
}

function savePlants(plants: Plant[]) {
  writeJson('plants.json', plants)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Greenhouse plant state. Care actions update the plant, then record an activity
 * through the activity service (later: emit an event that activity listens to).
 */
export const greenhouseService = {
  list() {
    return loadPlants()
  },

  get(plantId: string) {
    const plant = loadPlants().find((item) => item.id === plantId)
    if (!plant) throw Errors.missing(`Plant ${plantId} not found`)
    return plant
  },

  add(plant: Plant, ownerId: string) {
    if (!plant.id || !plant.title) throw Errors.invalid('Plant id and title are required')
    const plants = loadPlants()
    const row = { ...plant, ownerId }
    plants.unshift(row)
    savePlants(plants)
    return row
  },

  water(plantId: string, userId: string) {
    const plants = loadPlants()
    const plant = plants.find((item) => item.id === plantId && item.ownerId === userId)
    if (!plant) throw Errors.missing(`Plant ${plantId} not found for owner`)
    const at = today()
    plant.wateredAt = at
    plant.history = [{ at, label: 'Watered', labelHe: 'הושקה' }, ...plant.history]
    savePlants(plants)
    const activity = activityService.record({
      kind: 'water',
      userId,
      plantId: plant.id,
      body: `Water confirmed on ${plant.title}.`,
      bodyHe: `השקיה אושרה ל־${plant.titleHe}.`,
    })
    return { plant, activity }
  },

  refreshPhoto(plantId: string, userId: string) {
    const plants = loadPlants()
    const plant = plants.find((item) => item.id === plantId && item.ownerId === userId)
    if (!plant) throw Errors.missing(`Plant ${plantId} not found for owner`)
    const at = today()
    plant.photoAt = at
    plant.history = [{ at, label: 'Photo refreshed', labelHe: 'התמונה רועננה' }, ...plant.history]
    savePlants(plants)
    const activity = activityService.record({
      kind: 'photo',
      userId,
      plantId: plant.id,
      body: `${plant.title} photo refreshed.`,
      bodyHe: `תמונת ${plant.titleHe} רועננה.`,
    })
    return { plant, activity }
  },
}
