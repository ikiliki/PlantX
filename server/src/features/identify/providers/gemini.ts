import type { Catalog, CatalogSuggestionDraft } from '../../../../../src/mock/types.ts'
import { fallbackDraft, normalizeDraft, type CatalogDraftHint } from '../../catalog/catalogDraft.ts'
import { fetchWithTimeout, IdentifyTimeoutError, stripDataUrl } from '../http.ts'
import { IDENTIFY_TIMEOUT_MS, type IdentifyProvider, type ProviderHealth, type RawSuggestion } from '../types.ts'

const DOCS_URL = 'https://ai.google.dev/gemini-api/docs'
/**
 * Steady and fast first. The newest flash model is the one Google overloads and rate-limits
 * (2026-10-02: gemini-3.8-flash took 49s on a one-line prompt, then 503 and 429, while
 * gemini-3.5-flash answered in 1.4s), so it is the last resort, not the default.
 * A failed model is skipped for the next. GEMINI_MODEL is tried before this list.
 */
const MODEL_FALLBACKS = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash']
/**
 * Gemini 3 thinks at medium depth unless told otherwise. A plant check and a catalog
 * pick are short classifications, so keep thinking low and the scan fast.
 */
const THINKING_LEVEL = 'low'
/** Overloaded, retired, or out of quota: try the next model. Anything else is a real failure. */
const RETRYABLE_STATUS = new Set([404, 429, 503])
/**
 * One Gemini step (plant check, draft, size) across all its model attempts. A slow model
 * falls through to the next one inside this budget instead of failing the whole scan.
 */
const CALL_BUDGET_MS = 20_000
/** Not worth starting another model with less time than this left. */
const MIN_ATTEMPT_MS = 4_000

let lastError: string | undefined
let lastUsedAt: string | undefined
let activeModel: string | undefined

function modelsToTry() {
  const chosen = (process.env.GEMINI_MODEL || '').trim()
  return [...new Set(chosen ? [chosen, ...MODEL_FALLBACKS] : MODEL_FALLBACKS)]
}

function apiKey() {
  return (process.env.GEMINI_API_KEY || '').trim()
}

function optionIds(catalog: Catalog, propertyId: string): string[] {
  const prop = catalog.properties.find((item) => item.id === propertyId)
  return prop?.options.map((opt) => opt.id) ?? []
}

/** Gemini rejects an enum value of `""`. Unknown is `nullable`, not an empty choice. */
function nullableEnum(ids: string[], description?: string) {
  const values = [...new Set(ids.map((id) => id.trim()).filter(Boolean))]
  const field: Record<string, unknown> = { type: 'STRING', nullable: true }
  if (description) field.description = description
  if (values.length) field.enum = values
  return field
}

function traitPropertyIds(catalog: Catalog): string[] {
  return catalog.properties
    .filter((prop) => !['health', 'size', 'stage', 'area'].includes(prop.id))
    .map((prop) => prop.id)
}

function buildSchema(catalog: Catalog) {
  const categoryIds = catalog.categories.map((item) => item.id)
  const subcategoryIds = catalog.subcategories.map((item) => item.id)
  const sizes = optionIds(catalog, 'size')
  const stages = optionIds(catalog, 'stage')
  const traitIds = traitPropertyIds(catalog)

  const traitsProperties: Record<string, unknown> = {}
  for (const id of traitIds) {
    const options = optionIds(catalog, id)
    if (options.length === 0) continue
    traitsProperties[id] = nullableEnum(options, `Option id for catalog property ${id}`)
  }

  return {
    type: 'OBJECT',
    properties: {
      isPlant: { type: 'BOOLEAN', description: 'Whether the image shows a plant' },
      scientificName: { type: 'STRING' },
      commonNames: { type: 'ARRAY', items: { type: 'STRING' } },
      genus: { type: 'STRING', nullable: true },
      cultivar: { type: 'STRING', nullable: true },
      probability: { type: 'NUMBER', description: 'Confidence 0–1' },
      categoryId: nullableEnum(categoryIds, 'Best matching catalog category id'),
      subcategoryId: nullableEnum(subcategoryIds, 'Best matching catalog subcategory id'),
      size: nullableEnum(sizes, 'Size band of the plant in the photo'),
      stage: nullableEnum(stages),
      traits: {
        type: 'OBJECT',
        nullable: true,
        properties: traitsProperties,
      },
    },
    required: ['isPlant', 'scientificName', 'commonNames', 'probability'],
  }
}

function catalogBrief(catalog: Catalog): string {
  const categories = catalog.categories
    .map((cat) => {
      const subs = catalog.subcategories
        .filter((sub) => sub.categoryId === cat.id)
        .map((sub) => `${sub.id} (${sub.name} / ${sub.code})`)
        .join(', ')
      return `- ${cat.id}: ${cat.name} (${cat.nameHe}), ticker ${cat.ticker}; subcategories: ${subs || 'none'}`
    })
    .join('\n')
  const props = catalog.properties
    .map((prop) => {
      const opts = prop.options.map((opt) => `${opt.id}=${opt.label}`).join(', ')
      return `- ${prop.id}: ${opts}`
    })
    .join('\n')
  return `Catalog categories:\n${categories}\n\nProperty option ids:\n${props}`
}

/** The JSON object `buildSchema` asks the model to return. */
export type GeminiJson = {
  isPlant?: boolean
  scientificName?: string
  commonNames?: string[]
  genus?: string | null
  cultivar?: string | null
  probability?: number
  categoryId?: string | null
  subcategoryId?: string | null
  size?: string | null
  stage?: string | null
  traits?: Record<string, string | null> | null
}

function suggestionFromJson(parsed: GeminiJson): RawSuggestion {
  const scientificName = (parsed.scientificName || '').trim()
  const commonNames = (parsed.commonNames || []).filter(Boolean)
  const isPlant = Boolean(parsed.isPlant)
  const label = commonNames[0] || scientificName || (isPlant ? 'Unknown plant' : 'Not a plant')
  const traits: Record<string, string> = {}
  if (parsed.traits) {
    for (const [key, value] of Object.entries(parsed.traits)) {
      if (value) traits[key] = value
    }
  }
  return {
    provider: 'gemini',
    label,
    scientificName,
    commonNames,
    genus: parsed.genus?.trim() || undefined,
    cultivar: parsed.cultivar?.trim() || undefined,
    probability: typeof parsed.probability === 'number' ? parsed.probability : 0,
    isPlant,
    categoryId: parsed.categoryId?.trim() || undefined,
    subcategoryId: parsed.subcategoryId?.trim() || undefined,
    size: parsed.size?.trim() || undefined,
    stage: parsed.stage?.trim() || undefined,
    traits: Object.keys(traits).length ? traits : undefined,
  }
}

/** The fields of a `generateContent` response that the parser reads. */
export type GeminiBody = {
  candidates?: Array<{
    content?: { role?: string; parts?: Array<{ text?: string }> }
    finishReason?: string
    index?: number
  }>
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number }
  modelVersion?: string
}

export function parseGeminiBody(body: GeminiBody, _catalog: Catalog): RawSuggestion {
  const text = body.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || ''
  if (!text.trim()) throw new Error('Gemini returned empty content')
  let parsed: GeminiJson
  try {
    parsed = JSON.parse(text) as GeminiJson
  } catch {
    throw new Error('Gemini returned invalid JSON')
  }
  return suggestionFromJson(parsed)
}

/** One Gemini JSON call. Retries the next model on 404, 429, or 503. */
async function generate(image: string, prompt: string, schema: unknown): Promise<string> {
  const key = apiKey()
  if (!key) throw new Error('GEMINI_API_KEY missing')
  const { mime, base64 } = stripDataUrl(image)
  lastUsedAt = new Date().toISOString()
  const requestBody = JSON.stringify({
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }, { inlineData: { mimeType: mime, data: base64 } }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      thinkingConfig: { thinkingLevel: THINKING_LEVEL },
    },
  })
  let lastFailure = 'Gemini failed'
  let timedOut = false
  const deadline = Date.now() + CALL_BUDGET_MS
  for (const model of modelsToTry()) {
    const left = deadline - Date.now()
    if (left < MIN_ATTEMPT_MS) break
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`
    try {
      const res = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
        },
        Math.min(IDENTIFY_TIMEOUT_MS, left),
      )
      timedOut = false
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        lastFailure = `Gemini HTTP ${res.status}${text ? `: ${text.slice(0, 180)}` : ''}`
        // A model that rejects the thinking setting is skipped like an overloaded one.
        if (RETRYABLE_STATUS.has(res.status) || (res.status === 400 && /thinking/i.test(text))) continue
        break
      }
      const body = (await res.json()) as GeminiBody
      const text = body.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || ''
      if (!text.trim()) {
        lastFailure = 'Gemini returned empty content'
        break
      }
      activeModel = model
      lastError = undefined
      return text
    } catch (err) {
      if (err instanceof IdentifyTimeoutError) {
        // Slow or overloaded model: same as a 503, try the next one while the budget lasts.
        timedOut = true
        lastFailure = `Gemini ${model} timed out`
        continue
      }
      lastFailure = err instanceof Error ? err.message : 'Gemini failed'
      break
    }
  }
  lastError = lastFailure
  // Keep the timeout reason when the last attempt was a timeout, so history shows it as one.
  if (timedOut) throw new IdentifyTimeoutError()
  throw new Error(lastFailure)
}

const GATE_SCHEMA = {
  type: 'OBJECT',
  properties: { isPlant: { type: 'BOOLEAN', description: 'True only when the image shows a plant' } },
  required: ['isPlant'],
}

/** Cheap first call. A false result means Pl@ntNet must not be called. */
export async function gatePlant(image: string): Promise<boolean> {
  const text = await generate(
    image,
    [
      'Does this image show a plant, part of a plant, or a planted pot?',
      'Set isPlant true for those. Set isPlant false for people, animals, rooms, objects, food, or anything else.',
    ].join('\n'),
    GATE_SCHEMA,
  )
  const parsed = JSON.parse(text) as { isPlant?: boolean }
  return Boolean(parsed.isPlant)
}

/** Species fields the catalog draft is allowed to see. */
export type SpeciesHint = {
  label: string
  scientificName: string
  commonNames: string[]
  genus?: string
  cultivar?: string
  probability: number
}

/**
 * Second Gemini call. The schema is the catalog at this moment, so new categories
 * and properties are included. Unknown fields stay null.
 */
export async function draftPlantClass(image: string, catalog: Catalog, species: SpeciesHint | null): Promise<RawSuggestion> {
  const speciesBlock = species
    ? `Species result JSON:\n${JSON.stringify(species)}`
    : 'The species call did not return a name. Use the photo and the catalog.'
  const prompt = [
    'Fill a PlantX greenhouse draft for the plant in the photo.',
    speciesBlock,
    'Compare that result with the catalog. Use only the allowed ids.',
    'Fill categoryId, subcategoryId, size, stage, and trait option ids when you can.',
    'Leave a field null when you are not sure. Do not assign health.',
    'Set isPlant true unless the photo is clearly not a plant.',
    '',
    catalogBrief(catalog),
  ].join('\n')
  const text = await generate(image, prompt, buildSchema(catalog))
  let parsed: GeminiJson
  try {
    parsed = JSON.parse(text) as GeminiJson
  } catch {
    throw new Error('Gemini returned invalid JSON')
  }
  return suggestionFromJson(parsed)
}

/** Size only, after another provider already named the plant. Failures stay inside identify. */
export async function guessPlantSize(image: string, catalog: Catalog): Promise<string | undefined> {
  const key = apiKey()
  const sizes = optionIds(catalog, 'size')
  if (!key || sizes.length === 0) return undefined
  const { mime, base64 } = stripDataUrl(image)
  const prompt = [
    'Estimate the size band of the plant in this photo for a greenhouse catalog.',
    `Allowed size ids: ${sizes.join(', ')}.`,
    'Pick the closest band. If the photo does not show a plant, omit size.',
  ].join('\n')
  const requestBody = JSON.stringify({
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }, { inlineData: { mimeType: mime, data: base64 } }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingLevel: THINKING_LEVEL },
      responseSchema: {
        type: 'OBJECT',
        properties: { size: nullableEnum(sizes) },
        required: ['size'],
      },
    },
  })
  for (const model of modelsToTry()) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`
    try {
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
      })
      if (!res.ok) {
        if (RETRYABLE_STATUS.has(res.status)) continue
        return undefined
      }
      const body = (await res.json()) as GeminiBody
      const text = body.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || ''
      const parsed = JSON.parse(text) as { size?: string | null }
      const size = parsed.size?.trim()
      activeModel = model
      return size && sizes.includes(size) ? size : undefined
    } catch {
      return undefined
    }
  }
  return undefined
}

export const geminiProvider: IdentifyProvider = {
  id: 'gemini',
  order: 1,

  async status(): Promise<ProviderHealth> {
    const key = apiKey()
    return {
      id: 'gemini',
      order: 1,
      name: 'Gemini',
      returns: 'Plant check, then catalog fields from the current catalog',
      docsUrl: DOCS_URL,
      keySet: Boolean(key),
      status: key ? 'ready' : 'missingKey',
      model: activeModel || modelsToTry()[0],
      lastError,
      lastUsedAt,
    }
  },

  async identify(image: string, catalog: Catalog): Promise<RawSuggestion> {
    const prompt = [
      'Identify the plant in the image for a greenhouse marketplace catalog.',
      'Pick the best matching catalog category and subcategory ids when possible.',
      'Estimate size, stage, and trait option ids only from the allowed enums. Do not assign health.',
      'If unsure about a field, use null.',
      'Set isPlant false when the image is not a plant.',
      '',
      catalogBrief(catalog),
    ].join('\n')
    const text = await generate(image, prompt, buildSchema(catalog))
    let parsed: GeminiJson
    try {
      parsed = JSON.parse(text) as GeminiJson
    } catch {
      throw new Error('Gemini returned invalid JSON')
    }
    return suggestionFromJson(parsed)
  },
}

const DRAFT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    categoryName: { type: 'STRING' },
    categoryNameHe: { type: 'STRING' },
    ticker: { type: 'STRING' },
    subcategoryName: { type: 'STRING' },
    subcategoryNameHe: { type: 'STRING' },
    code: { type: 'STRING' },
    properties: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          nameHe: { type: 'STRING' },
          required: { type: 'BOOLEAN' },
          inMarketName: { type: 'BOOLEAN' },
          sign: { type: 'STRING' },
          scope: { type: 'STRING', enum: ['category', 'subcategory'] },
          options: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                label: { type: 'STRING' },
                labelHe: { type: 'STRING' },
                sign: { type: 'STRING' },
              },
              required: ['label', 'labelHe', 'sign'],
            },
          },
        },
        required: ['name', 'nameHe', 'required', 'inMarketName', 'sign', 'scope', 'options'],
      },
    },
  },
  required: [
    'categoryName',
    'categoryNameHe',
    'ticker',
    'subcategoryName',
    'subcategoryNameHe',
    'code',
    'properties',
  ],
}

/**
 * Catalog entry for a plant that matched no category.
 * The scan photo is attached by the caller. A missing key or a model error returns names only.
 */
export async function draftCatalogEntry(image: string, hint: CatalogDraftHint): Promise<CatalogSuggestionDraft> {
  const key = apiKey()
  if (!key || !usableImage(image)) return fallbackDraft(hint)
  const { mime, base64 } = stripDataUrl(image)
  const avoided = hint.takenSigns.filter(Boolean).join(', ') || 'none'
  const prompt = [
    'The plant in the photo is not in the marketplace catalog yet.',
    'Propose one category (the trade group or genus), one subcategory (the cultivar or common form), and 1 to 3 properties that distinguish listings of this plant.',
    'Write English and Hebrew names. Ticker and subcategory code are short capital letters.',
    'Each property has 2 to 4 options. Option signs are 1–3 capital letters and unique within that property.',
    `Property signs are 1–3 capital letters, unique, and must not be any of: ${avoided}.`,
    'Do not propose health, size, or stage. Those already exist.',
    'scope is "category" when every subcategory shares the property, otherwise "subcategory".',
    'Name the plant shown in the photo. The photo itself is stored separately.',
    '',
    `Known name: ${hint.name}`,
    `Scientific name: ${hint.scientificName}`,
    `Genus: ${hint.genus}`,
    `Common names: ${hint.commonNames.join(', ')}`,
    hint.cultivar ? `Cultivar: ${hint.cultivar}` : '',
    `Identified by: ${hint.provider}`,
  ]
    .filter(Boolean)
    .join('\n')

  const requestBody = JSON.stringify({
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }, { inlineData: { mimeType: mime, data: base64 } }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: DRAFT_SCHEMA,
      thinkingConfig: { thinkingLevel: THINKING_LEVEL },
    },
  })

  for (const model of modelsToTry()) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`
    try {
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
      })
      if (!res.ok) {
        if (RETRYABLE_STATUS.has(res.status)) continue
        return fallbackDraft(hint)
      }
      const body = (await res.json()) as GeminiBody
      const text = body.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || ''
      const parsed = text.trim() ? (JSON.parse(text) as unknown) : undefined
      activeModel = model
      return normalizeDraft(parsed, hint)
    } catch {
      return fallbackDraft(hint)
    }
  }
  return fallbackDraft(hint)
}

function usableImage(image: string) {
  return /^data:image\//i.test(image) && image.length <= 1_500_000
}

/** One care rule as Gemini suggests it for a category (or one of its varieties). */
export type SuggestedCareRule = {
  taskId: string
  subcategoryId?: string
  mode: 'must' | 'optional' | 'off'
  everyDays?: number
  winterEveryDays?: number
  months?: number[]
}

/**
 * Care intervals for one catalog category, from text only (no photo): Gemini fills a rule per known care
 * task, and a variety rule only where a variety needs something different. The admin's "Suggest with AI"
 * in Care plans; never called automatically. Null without a key or on a model error.
 */
export async function suggestCarePlan(input: {
  category: string
  scientificName?: string
  varieties: { id: string; name: string }[]
  tasks: { id: string; name: string; audience: string }[]
}): Promise<SuggestedCareRule[] | null> {
  const key = apiKey()
  if (!key) return null
  const schema = {
    type: 'OBJECT',
    properties: {
      rules: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            taskId: { type: 'STRING', enum: input.tasks.map((task) => task.id) },
            subcategoryId: nullableEnum(input.varieties.map((item) => item.id), 'Only when this variety differs from the category'),
            mode: { type: 'STRING', enum: ['must', 'optional', 'off'] },
            everyDays: { type: 'INTEGER', nullable: true },
            winterEveryDays: { type: 'INTEGER', nullable: true, description: 'November to February, when it differs' },
            months: { type: 'ARRAY', nullable: true, items: { type: 'INTEGER' }, description: 'Active months 1-12 for seasonal care' },
          },
          required: ['taskId', 'mode'],
        },
      },
    },
    required: ['rules'],
  }
  const prompt = [
    'You set indoor care intervals for a home-plant app in Israel (Mediterranean climate, indoor plants).',
    `Plant category: ${input.category}${input.scientificName ? ` (${input.scientificName})` : ''}.`,
    `Varieties: ${input.varieties.map((item) => `${item.id} = ${item.name}`).join('; ') || 'none'}.`,
    `Care tasks: ${input.tasks.map((task) => `${task.id} = ${task.name}`).join('; ')}.`,
    'Give one category rule (no subcategoryId) per task: mode must when every plant of this kind needs it, optional when some owners may want it, off when it does not apply.',
    'everyDays is the usual interval; winterEveryDays only when winter differs; months only for seasonal care such as feeding.',
    'Add a rule with subcategoryId only when that variety needs a different interval or mode than its category.',
  ].join('\n')
  const requestBody = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      thinkingConfig: { thinkingLevel: THINKING_LEVEL },
    },
  })
  for (const model of modelsToTry()) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`
    try {
      const res = await fetchWithTimeout(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: requestBody })
      if (!res.ok) {
        if (RETRYABLE_STATUS.has(res.status)) continue
        lastError = `Gemini HTTP ${res.status}`
        return null
      }
      const body = (await res.json()) as GeminiBody
      const text = body.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || ''
      const parsed = text.trim() ? (JSON.parse(text) as { rules?: SuggestedCareRule[] }) : undefined
      activeModel = model
      lastUsedAt = new Date().toISOString()
      return Array.isArray(parsed?.rules) ? parsed.rules : null
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Gemini failed'
      return null
    }
  }
  return null
}
