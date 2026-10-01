import type {
  Catalog,
  Diagnosis,
  IdentifyFieldCheck,
  IdentifyFieldChecks,
  IdentifyProviderId,
  PhotoCheck,
  PlantClassDraft,
  PlantIdentification,
} from '../../mock/types'

/** Shared by the server (trust rules) and the client (optimistic preview). Pure, no React. */

export const PROVIDER_LABEL: Record<IdentifyProviderId, string> = {
  plantid: 'Plant.id',
  plantnet: 'Pl@ntNet',
  gemini: 'Gemini',
}

export const PROVIDER_CHAIN: IdentifyProviderId[] = ['plantid', 'plantnet', 'gemini']

export const MAX_PLANT_PHOTOS = 3

/** The class a plant is saved with, as both a draft and a stored plant can describe it. */
export type SavedClass = {
  speciesId: string
  subcategoryId?: string
  quality?: string
  sizeBand?: string
  stage?: string
}

/** One photo's identify answer. `requestId` is absent in UI-mock mode and for photos that were never sent. */
export type PhotoScanResult = {
  diagnosis?: Diagnosis
  requestId?: string
  scanned: boolean
}

/** A diagnosis the owner can build on: a plant that maps to a catalog category. */
export function isUsableDiagnosis(diagnosis: Diagnosis | null | undefined): diagnosis is Diagnosis {
  return Boolean(diagnosis?.isPlant && diagnosis.draft.categoryId)
}

/** Wizard: the draft still follows this diagnosis' category and, when given, subcategory. */
export function draftMatchesDiagnosis(draft: PlantClassDraft, diagnosis: Diagnosis | null | undefined) {
  if (!isUsableDiagnosis(diagnosis)) return false
  if (draft.categoryId !== diagnosis.draft.categoryId) return false
  return !diagnosis.draft.subcategoryId || draft.subcategoryId === diagnosis.draft.subcategoryId
}

export function savedClassFromDraft(draft: PlantClassDraft, catalog: Catalog): SavedClass | null {
  const category = catalog.categories.find((item) => item.id === draft.categoryId)
  if (!category) return null
  return {
    speciesId: category.speciesId,
    subcategoryId: draft.subcategoryId || undefined,
    quality: draft.quality || undefined,
    sizeBand: draft.size || undefined,
    stage: draft.stage || undefined,
  }
}

/** The provider saw the saved category and, when it named one, the saved subcategory. */
export function classMatchesDiagnosis(saved: SavedClass, diagnosis: Diagnosis | null | undefined, catalog: Catalog) {
  if (!diagnosis?.isPlant) return false
  const category = catalog.categories.find((item) => item.id === diagnosis.draft.categoryId)
  if (!category || category.speciesId !== saved.speciesId) return false
  return !diagnosis.draft.subcategoryId || diagnosis.draft.subcategoryId === saved.subcategoryId
}

export function photoCheckFor(
  position: number,
  saved: SavedClass | null,
  scan: PhotoScanResult | undefined,
  catalog: Catalog,
): PhotoCheck {
  if (!scan?.scanned) return { position, result: 'unscanned' }
  const { diagnosis, requestId } = scan
  if (!diagnosis) return { position, result: 'failed', requestId }
  const base: PhotoCheck = {
    position,
    result: 'mismatch',
    requestId,
    provider: diagnosis.provider,
    mode: diagnosis.mode,
    label: diagnosis.label,
    probability: diagnosis.probability,
  }
  if (!diagnosis.isPlant) return { ...base, result: 'notPlant' }
  return { ...base, result: saved && classMatchesDiagnosis(saved, diagnosis, catalog) ? 'match' : 'mismatch' }
}

function fieldCheck(suggested: string | undefined, saved: string | undefined): IdentifyFieldCheck {
  if (!suggested) return 'manual'
  return suggested === saved ? 'kept' : 'changed'
}

/** Per class field: did the owner keep the AI's value, change it, or fill it with no AI value? */
export function fieldChecksFor(saved: SavedClass, diagnosis: Diagnosis, catalog: Catalog): IdentifyFieldChecks {
  const { draft } = diagnosis
  const category = catalog.categories.find((item) => item.id === draft.categoryId)
  return {
    category: draft.categoryId ? (category?.speciesId === saved.speciesId ? 'kept' : 'changed') : 'manual',
    subcategory: fieldCheck(draft.subcategoryId, saved.subcategoryId),
    quality: fieldCheck(draft.quality, saved.quality),
    size: fieldCheck(draft.size, saved.sizeBand),
    stage: fieldCheck(draft.stage, saved.stage),
  }
}

/**
 * The first photo whose answer matches the saved class verifies the plant (`ai`).
 * With no match, the first plant answer marks it `edited`. With no plant answer it is `manual`.
 */
export function identificationFor(
  saved: SavedClass | null,
  scans: (PhotoScanResult | undefined)[],
  catalog: Catalog,
  at = new Date().toISOString(),
): PlantIdentification {
  const photos = scans.map((scan, position) => photoCheckFor(position, saved, scan, catalog))
  const withPhotos = photos.length > 0 ? { photos } : {}
  let lead = photos.findIndex((check) => check.result === 'match')
  if (lead < 0) lead = scans.findIndex((scan) => scan?.diagnosis?.isPlant)
  const diagnosis = lead >= 0 ? scans[lead]?.diagnosis : undefined
  if (!diagnosis) return { source: 'manual', at, ...withPhotos }
  return {
    source: photos[lead].result === 'match' ? 'ai' : 'edited',
    provider: diagnosis.provider,
    mode: diagnosis.mode,
    label: diagnosis.label,
    scientificName: diagnosis.scientificName,
    probability: diagnosis.probability,
    requestId: scans[lead]?.requestId,
    at,
    ...withPhotos,
  }
}

function pctOf(probability: number) {
  return `${Math.round(probability * 100)}%`
}

/** Text of the `scan` activity. Stored in both languages like every activity. */
export function scanActivityText(diagnosis: Diagnosis | undefined) {
  if (!diagnosis) {
    return {
      body: 'AI scan: no provider could identify the photo.',
      bodyHe: 'סריקת AI: אף ספק לא הצליח לזהות את התמונה.',
    }
  }
  if (!diagnosis.isPlant) {
    return {
      body: 'AI scan: the photo does not show a plant.',
      bodyHe: 'סריקת AI: בתמונה לא נמצא צמח.',
    }
  }
  const by = `${PROVIDER_LABEL[diagnosis.provider]} ${pctOf(diagnosis.probability)}`
  return {
    body: `AI scan: ${diagnosis.label} · ${by}.`,
    bodyHe: `סריקת AI: ${diagnosis.label} · ${by}.`,
  }
}

/** Text of the `added` activity. */
export function addedActivityText(title: string, titleHe: string, identification: PlantIdentification) {
  const provider = identification.provider ? PROVIDER_LABEL[identification.provider] : ''
  if (identification.source === 'ai') {
    return {
      body: `${title} added to the greenhouse · AI verified by ${provider}.`,
      bodyHe: `${titleHe} נוסף לחממה · אומת ב־AI על ידי ${provider}.`,
    }
  }
  if (identification.source === 'edited') {
    return {
      body: `${title} added to the greenhouse · the AI answer was changed by hand.`,
      bodyHe: `${titleHe} נוסף לחממה · תשובת ה־AI שונתה ידנית.`,
    }
  }
  return {
    body: `${title} added to the greenhouse · filled in by hand, not verified by AI.`,
    bodyHe: `${titleHe} נוסף לחממה · מולא ידנית, לא אומת ב־AI.`,
  }
}
