import type { Listing, MockDb, Plant, User } from './types'

export interface Place {
  region: string
  regionHe: string
  lat: number
  lng: number
}

export interface Area extends Place {
  id: string
}

export const AREAS: Area[] = [
  { id: 'tel-aviv', region: 'Tel Aviv', regionHe: 'תל אביב', lat: 32.0853, lng: 34.7818 },
  { id: 'central', region: 'Central Israel', regionHe: 'מרכז', lat: 31.973, lng: 34.807 },
  { id: 'sharon', region: 'Sharon', regionHe: 'שרון', lat: 32.3215, lng: 34.8532 },
  { id: 'haifa', region: 'Haifa', regionHe: 'חיפה', lat: 32.794, lng: 34.9896 },
  { id: 'israel', region: 'Israel', regionHe: 'ישראל', lat: 31.411, lng: 35.082 },
]

/** Areas a shopper can pick. The country-wide label is not a specific place. */
export const MARKET_AREAS = AREAS.filter((area) => area.id !== 'israel')

export const RADIUS_KM = [20, 50, 100] as const

const ALIASES: Record<string, string> = {
  'tel aviv': 'tel-aviv',
  'תל אביב': 'tel-aviv',
  central: 'central',
  'central israel': 'central',
  מרכז: 'central',
  sharon: 'sharon',
  שרון: 'sharon',
  haifa: 'haifa',
  חיפה: 'haifa',
  israel: 'israel',
  ישראל: 'israel',
}

export function resolveArea(value: string | undefined | null): Area | undefined {
  if (!value) return undefined
  const key = value.trim().toLowerCase()
  if (!key || key === '—' || key === '-' || key === '–') return undefined
  const id = ALIASES[key]
  return id ? AREAS.find((area) => area.id === id) : undefined
}

export function areaById(id: string): Area | undefined {
  return AREAS.find((area) => area.id === id)
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)))
}

export function userPlace(user: User | null | undefined): Place | null {
  if (!user) return null
  const area = resolveArea(user.region)
  if (!area) return null
  return {
    region: area.region,
    regionHe: user.regionHe && user.regionHe !== '—' ? user.regionHe : area.regionHe,
    lat: user.lat ?? area.lat,
    lng: user.lng ?? area.lng,
  }
}

export function plantPlace(plant: Plant): Place | null {
  const area = resolveArea(plant.locationZone)
  const lat = plant.lat ?? area?.lat
  const lng = plant.lng ?? area?.lng
  if (lat == null || lng == null || !area) return null
  return {
    region: area.region,
    regionHe: plant.locationZoneHe || area.regionHe,
    lat,
    lng,
  }
}

export function listingPlace(listing: Listing, plant?: Plant): Place | null {
  if (plant) {
    const fromPlant = plantPlace(plant)
    if (fromPlant) return fromPlant
  }
  const area = resolveArea(listing.region)
  if (!area) return null
  return {
    region: area.region,
    regionHe: listing.regionHe || area.regionHe,
    lat: area.lat,
    lng: area.lng,
  }
}

export function greenhousePlace(input: {
  user: User | null
  signedIn: boolean
  ownerId: string
  plants: Plant[]
}): Place | null {
  if (input.signedIn) {
    const fromUser = userPlace(input.user)
    if (fromUser) return fromUser
  }
  for (const plant of input.plants) {
    if (plant.ownerId !== input.ownerId) continue
    const place = plantPlace(plant)
    if (place) return place
  }
  return null
}

export function placeMatches(
  place: Place | null,
  filter: { areaId: string; radiusKm: number | null },
  origin: { lat: number; lng: number } | null,
) {
  const active = Boolean(filter.areaId) || filter.radiusKm != null
  if (!active) return true
  if (!place) return false
  if (filter.areaId) {
    const area = areaById(filter.areaId)
    if (!area || place.region !== area.region) return false
  }
  if (filter.radiusKm != null) {
    if (!origin) return false
    if (distanceKm(origin, place) > filter.radiusKm) return false
  }
  return true
}

export function fieldsFromPlace(place: Place) {
  return {
    locationZone: place.region,
    locationZoneHe: place.regionHe,
    lat: place.lat,
    lng: place.lng,
  }
}

/** Fill coordinates on older saved data so every plant and known user has a place. */
export function hydrateLocations(db: MockDb) {
  for (const user of db.users) {
    const area = resolveArea(user.region)
    if (!area) continue
    if (user.lat == null) user.lat = area.lat
    if (user.lng == null) user.lng = area.lng
    if (!user.regionHe || user.regionHe === '—') user.regionHe = area.regionHe
  }
  for (const plant of db.plants) {
    const owner = db.users.find((user) => user.id === plant.ownerId)
    const area = resolveArea(plant.locationZone) ?? resolveArea(owner?.region)
    if (!area) continue
    plant.locationZone = area.region
    if (!plant.locationZoneHe) plant.locationZoneHe = area.regionHe
    if (plant.lat == null) plant.lat = area.lat
    if (plant.lng == null) plant.lng = area.lng
  }
  return db
}
