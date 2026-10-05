import type { Plant, QualityGrade, SizeBand, StageBand } from '../../mock/types'

/**
 * A signed-out guest's plants, kept in this browser only: what they filled in Add Plant, with no
 * location, no AI result and no care tasks. They are sent to the account on the next sign-in
 * (the store does that) and removed here once the server has saved each one.
 */
export type GuestPlant = {
  id: string
  createdAt: string
  title: string
  titleHe: string
  description: string
  descriptionHe: string
  photos: string[]
  speciesId: string
  variety: string
  varietyHe: string
  quality: QualityGrade | ''
  sizeBand: SizeBand
  stage: StageBand
  code: string
  subcategoryId?: string
  traits?: Record<string, string>
}

const KEY = 'plantx.guestPlants.v1'
/** Photos are data URLs; a few plants keep this well inside the browser's storage quota. */
export const GUEST_PLANT_LIMIT = 3

export function loadGuestPlants(): GuestPlant[] {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(list) ? (list as GuestPlant[]).filter((item) => item && typeof item.id === 'string') : []
  } catch {
    return []
  }
}

/** False when the browser refused (private mode, quota): the caller tells the guest it wasn't kept. */
export function saveGuestPlants(list: GuestPlant[]): boolean {
  try {
    if (list.length === 0) localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, JSON.stringify(list))
    return true
  } catch {
    return false
  }
}

/** A card-shaped plant for the guest shelf. Not stored anywhere else. */
export function guestPlantAsPlant(item: GuestPlant): Plant {
  return {
    id: item.id,
    code: item.code,
    ownerId: '',
    speciesId: item.speciesId,
    variety: item.variety,
    varietyHe: item.varietyHe,
    subcategoryId: item.subcategoryId,
    traits: item.traits,
    title: item.title,
    titleHe: item.titleHe,
    description: item.description,
    descriptionHe: item.descriptionHe,
    photos: item.photos,
    quantity: 1,
    sizeGrade: item.sizeBand,
    sizeBand: item.sizeBand,
    quality: item.quality,
    stage: item.stage,
    rooting: item.stage === 'CUT' ? 'unrooted' : item.stage === 'ROOTED' ? 'rooted' : 'established',
    // No location for a guest plant: the account's greenhouse place is used once it is sent.
    locationZone: '',
    locationZoneHe: '',
    lat: 0,
    lng: 0,
    status: 'owned',
    createdAt: item.createdAt,
    history: [],
  }
}
