import { resolveArea, UNKNOWN_AREA } from '../../../../src/mock/locations.ts'
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

/** Missing or unrecognized region is Unknown. The area trait is not stored. */
function withLocation(plant: Plant): Plant {
  const area = resolveArea(plant.locationZone) ?? UNKNOWN_AREA
  const known = Boolean(resolveArea(plant.locationZone))
  const traits = plant.traits ? { ...plant.traits } : undefined
  if (traits) delete traits.area
  return {
    ...plant,
    traits,
    locationZone: area.region,
    locationZoneHe: known && plant.locationZoneHe?.trim() ? plant.locationZoneHe : area.regionHe,
    lat: known && Number.isFinite(plant.lat) ? plant.lat : area.lat,
    lng: known && Number.isFinite(plant.lng) ? plant.lng : area.lng,
  }
}

function savedClassOf(plant: Plant): SavedClass {
  return {
    speciesId: plant.speciesId,
    subcategoryId: plant.subcategoryId,
    quality: plant.quality,
    sizeBand: plant.sizeBand,
    stage: plant.stage,
    traits: plant.traits,
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
    // Add only creates. The id comes from the client, so an existing id would overwrite someone else's plant.
    const existing = await store.plants.list()
    if (existing.some((item) => item.id === plant.id)) throw Errors.exists(`Plant ${plant.id} already exists`)
    const parent = plant.parentId ? existing.find((item) => item.id === plant.parentId) : undefined
    if (plant.parentId && parent?.ownerId !== ownerId) throw Errors.forbidden('Parent plant is not yours')
    const catalog = await catalogService.get()
    const records = await trustedRequests(identifyRequestIds, ownerId, photos.length)
    const identification = identificationFor(
      savedClassOf(plant),
      records.map((record) => (record ? { scanned: true, diagnosis: record.diagnosis, requestId: record.id } : undefined)),
      catalog,
    )
    // Passport fields the owner may not set: verification, community grades, sale history, status and timeline.
    const {
      verifiedAt: _va,
      verifiedBy: _vb,
      grades: _g,
      comps: _c,
      publishedAt: _pa,
      ...rest
    } = plant
    const createdAt = today()
    const row: Plant = {
      ...withLocation({
        ...rest,
        photos,
        ownerId,
        status: 'owned',
        createdAt,
        history: [{ at: createdAt, label: 'Added to greenhouse', labelHe: 'נוסף לחממה' }],
      }),
      identification,
    }
    await store.plants.upsert([row])
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
