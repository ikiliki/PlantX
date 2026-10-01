import type { IdentifyRequestRecord, Plant } from '../../../../src/mock/types.ts'
import {
  MAX_PLANT_PHOTOS,
  addedActivityText,
  fieldChecksFor,
  identificationFor,
  type SavedClass,
} from '../../../../src/features/greenhouse/identification.ts'
import { getStore } from '../../db/index.ts'
import { Errors } from '../../lib/errors.ts'
import { logger } from '../../lib/logger.ts'
import { activityService } from '../activity/activity.service.ts'
import { catalogService } from '../catalog/catalog.service.ts'
import { todoService } from '../todo/todo.service.ts'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function savedClassOf(plant: Plant): SavedClass {
  return {
    speciesId: plant.speciesId,
    subcategoryId: plant.subcategoryId,
    quality: plant.quality,
    sizeBand: plant.sizeBand,
    stage: plant.stage,
  }
}

/**
 * Never trusts the client's `identification`. A request counts only when it is this owner's
 * Add Plant call, not already used by another plant, and not repeated for another photo.
 */
async function trustedRequests(ids: (string | undefined)[], ownerId: string, photoCount: number) {
  const seen = new Set<string>()
  const records: (IdentifyRequestRecord | undefined)[] = []
  for (let position = 0; position < photoCount; position++) {
    const id = ids[position]
    if (!id || seen.has(id)) {
      records.push(undefined)
      continue
    }
    seen.add(id)
    const record = await getStore().identifyRequests.get(id)
    const trusted = record && record.userId === ownerId && record.source === 'addPlant' && !record.plantId
    records.push(trusted ? record : undefined)
  }
  return records
}

/** Links each used request to the plant and moves its `scan` activity under the plant. Never fails the add. */
async function linkRequests(plant: Plant, records: (IdentifyRequestRecord | undefined)[]) {
  const catalog = await catalogService.get()
  const saved = savedClassOf(plant)
  const used: string[] = []
  for (const [photoIndex, record] of records.entries()) {
    if (!record) continue
    used.push(record.id)
    const fields = record.diagnosis?.isPlant ? fieldChecksFor(saved, record.diagnosis, catalog) : undefined
    await getStore().identifyRequests.link(record.id, { plantId: plant.id, photoIndex, fields })
  }
  const identification = plant.identification ?? { source: 'manual' as const, at: new Date().toISOString() }
  await activityService.recordAdded(
    {
      kind: 'added',
      userId: plant.ownerId,
      plantId: plant.id,
      identifyRequestId: identification.requestId,
      ...addedActivityText(plant.title, plant.titleHe, identification),
    },
    used,
  )
}

/**
 * Greenhouse plant state. Care lives on todos; water and photo completion go through todo.service.
 */
export const greenhouseService = {
  async list() {
    return getStore().plants.list()
  },

  async count() {
    return getStore().plants.count()
  },

  async get(plantId: string) {
    const plant = (await getStore().plants.list()).find((item) => item.id === plantId)
    if (!plant) throw Errors.missing(`Plant ${plantId} not found`)
    return plant
  },

  /** `identifyRequestIds[i]` is the Add Plant identify request for `plant.photos[i]`, when that photo was scanned. */
  async add(plant: Plant, ownerId: string, identifyRequestIds: (string | undefined)[] = []) {
    if (!plant.id || !plant.title) throw Errors.invalid('Plant id and title are required')
    const photos = (plant.photos ?? []).filter(Boolean)
    if (photos.length > MAX_PLANT_PHOTOS) throw Errors.invalid(`A plant has at most ${MAX_PLANT_PHOTOS} photos`)
    const store = getStore()
    const catalog = await catalogService.get()
    const records = await trustedRequests(identifyRequestIds, ownerId, photos.length)
    const identification = identificationFor(
      savedClassOf(plant),
      records.map((record) => (record ? { scanned: true, diagnosis: record.diagnosis, requestId: record.id } : undefined)),
      catalog,
    )
    const plants = await store.plants.list()
    const { wateredAt: _w, photoAt: _p, ...rest } = plant as Plant & { wateredAt?: string; photoAt?: string }
    const row: Plant = { ...rest, photos, ownerId, identification }
    plants.unshift(row)
    await store.plants.saveAll(plants)
    try {
      await linkRequests(row, records)
    } catch (err) {
      logger.error('identify link failed', { plantId: row.id }, err)
    }
    try {
      await todoService.ensureFirstWater(row.id, ownerId)
      if (photos.length > 0) await todoService.schedulePhoto(row.id, ownerId, today())
    } catch (err) {
      logger.error('todo schedule failed', { plantId: row.id }, err)
    }
    return row
  },
}
