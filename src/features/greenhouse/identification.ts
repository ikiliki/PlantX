import type {
  Catalog,
  Diagnosis,
  IdentifyFieldCheck,
  IdentifyFieldChecks,
  IdentifyFieldMark,
  IdentifyFieldMarks,
  PhotoCheck,
  PlantClassDraft,
  PlantIdentification,
} from '../../mock/types'

/** Shared by the server (trust rules) and the client (optimistic preview). Pure, no React. */

/** Storage cap. PhotoIdentify and stories can still fill every slot. */
export const MAX_PLANT_PHOTOS = 3

/** Add Plant upload cap. Raise this toward `MAX_PLANT_PHOTOS` when more angles ship. */
export const ADD_PLANT_UPLOAD_LIMIT = 1

/** The class a plant is saved with, as both a draft and a stored plant can describe it. */
export type SavedClass = {
  speciesId: string
  subcategoryId?: string
  quality?: string
  sizeBand?: string
  stage?: string
  /** Catalog trait values (property id → option id), for per-trait AI provenance. */
  traits?: Record<string, string>
}

/** Property ids that are class fields or the location, not traits the AI can fill. */
const NOT_TRAITS = new Set(['health', 'size', 'stage', 'area'])

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
  // Other is not a catalog category, but it is a class the plant is saved with (speciesId `other`).
  const speciesId =
    draft.categoryId === OTHER_SPECIES_ID
      ? OTHER_SPECIES_ID
      : catalog.categories.find((item) => item.id === draft.categoryId)?.speciesId
  if (!speciesId) return null
  return {
    speciesId,
    subcategoryId: draft.subcategoryId || undefined,
    quality: draft.quality || undefined,
    sizeBand: draft.size || undefined,
    stage: draft.stage || undefined,
    traits: draft.traits,
  }
}

/** Species id of a plant saved as Other: a plant the catalog does not know yet. */
export const OTHER_SPECIES_ID = 'other'

/** The AI recognized a plant but no catalog category fits it. */
export function isNotInCatalogAnswer(diagnosis: Diagnosis | null | undefined) {
  return Boolean(diagnosis?.isPlant && !diagnosis.draft.categoryId)
}

/**
 * The provider saw the saved category and, when it named one, the saved subcategory.
 * A plant the AI recognized but the catalog lacks matches when it is saved as Other.
 */
export function classMatchesDiagnosis(saved: SavedClass, diagnosis: Diagnosis | null | undefined, catalog: Catalog) {
  if (!diagnosis?.isPlant) return false
  if (isNotInCatalogAnswer(diagnosis)) return saved.speciesId === OTHER_SPECIES_ID
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
    category: draft.categoryId
      ? category?.speciesId === saved.speciesId
        ? 'kept'
        : 'changed'
      : isNotInCatalogAnswer(diagnosis)
        ? saved.speciesId === OTHER_SPECIES_ID
          ? 'kept'
          : 'changed'
        : 'manual',
    subcategory: fieldCheck(draft.subcategoryId, saved.subcategoryId),
    quality: fieldCheck(draft.quality, saved.quality),
    size: fieldCheck(draft.size, saved.sizeBand),
    stage: fieldCheck(draft.stage, saved.stage),
  }
}

/**
 * Same per-field verdicts, each carrying the AI's suggested value so a `changed` field
 * can show what the AI had answered. `category`'s AI value is the suggested category id.
 * Stored on the plant's identification; resolved to labels at render time.
 */
export function fieldMarksFor(saved: SavedClass, diagnosis: Diagnosis, catalog: Catalog): IdentifyFieldMarks {
  const checks = fieldChecksFor(saved, diagnosis, catalog)
  const { draft } = diagnosis
  const aiValues: Record<keyof IdentifyFieldChecks, string | undefined> = {
    category: draft.categoryId || undefined,
    subcategory: draft.subcategoryId || undefined,
    quality: draft.quality || undefined,
    size: draft.size || undefined,
    stage: draft.stage || undefined,
  }
  const marks: IdentifyFieldMarks = {}
  for (const key of Object.keys(checks) as (keyof IdentifyFieldChecks)[]) {
    const check = checks[key]
    // `manual` fields had no AI value and carry no stamp; keep the record lean.
    if (!check || check === 'manual') continue
    marks[key] = { check, aiValue: aiValues[key] }
  }
  // Traits the AI filled: kept when the saved value is the AI's option, changed otherwise.
  const traits: Record<string, IdentifyFieldMark> = {}
  for (const [id, aiValue] of Object.entries(draft.traits ?? {})) {
    if (!aiValue || NOT_TRAITS.has(id)) continue
    traits[id] = { check: saved.traits?.[id] === aiValue ? 'kept' : 'changed', aiValue }
  }
  if (Object.keys(traits).length > 0) marks.traits = traits
  return marks
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
  // Per-field provenance so each saved detail can show an AI stamp and, when changed, the AI value.
  const marks = saved && diagnosis.isPlant ? fieldMarksFor(saved, diagnosis, catalog) : {}
  const withFields = Object.keys(marks).length > 0 ? { fields: marks } : {}
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
    ...withFields,
  }
}

function pctOf(probability: number) {
  return `${Math.round(probability * 100)}%`
}

/** Text of the `scan` activity. Stored in both languages like every activity. */
export function scanActivityText(diagnosis: Diagnosis | undefined) {
  if (!diagnosis) {
    return {
      body: 'AI scan: the photo could not be identified.',
      bodyHe: 'סריקת AI: לא הצלחנו לזהות את התמונה.',
    }
  }
  if (!diagnosis.isPlant) {
    return {
      body: 'AI scan: the photo does not show a plant.',
      bodyHe: 'סריקת AI: בתמונה לא נמצא צמח.',
    }
  }
  return {
    body: `AI scan: ${diagnosis.label} · ${pctOf(diagnosis.probability)}.`,
    bodyHe: `סריקת AI: ${diagnosis.label} · ${pctOf(diagnosis.probability)}.`,
  }
}

/** Text of the `added` activity. */
export function addedActivityText(title: string, titleHe: string, identification: PlantIdentification) {
  if (identification.source === 'ai') {
    return {
      body: `${title} added to the greenhouse · verified by AI.`,
      bodyHe: `${titleHe} נוסף לחממה · אומת ב־AI.`,
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
