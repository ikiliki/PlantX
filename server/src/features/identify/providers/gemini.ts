import type { Catalog } from '../../../../../src/mock/types.ts'
import { fetchWithTimeout, stripDataUrl } from '../http.ts'
import type { IdentifyProvider, ProviderHealth, RawSuggestion } from '../types.ts'

const DOCS_URL = 'https://ai.google.dev/gemini-api/docs'
/**
 * Newest first. Google retires flash models and overloads the latest one (404 / 503),
 * so a failed model is skipped for the next. GEMINI_MODEL is tried before this list.
 */
const MODEL_FALLBACKS = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite']
/** Overloaded, retired, or out of quota: try the next model. Anything else is a real failure. */
const RETRYABLE_STATUS = new Set([404, 429, 503])

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
    .filter((prop) => !['grade', 'size', 'stage', 'area'].includes(prop.id))
    .map((prop) => prop.id)
}

function buildSchema(catalog: Catalog) {
  const categoryIds = catalog.categories.map((item) => item.id)
  const subcategoryIds = catalog.subcategories.map((item) => item.id)
  const grades = optionIds(catalog, 'grade')
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
      quality: nullableEnum(grades),
      size: nullableEnum(sizes),
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
  quality?: string | null
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
    quality: parsed.quality?.trim() || undefined,
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

export const geminiProvider: IdentifyProvider = {
  id: 'gemini',
  order: 3,

  async status(): Promise<ProviderHealth> {
    const key = apiKey()
    return {
      id: 'gemini',
      order: 3,
      name: 'Gemini',
      returns: 'Catalog match plus grade, size, stage, traits',
      docsUrl: DOCS_URL,
      keySet: Boolean(key),
      status: key ? 'ready' : 'missingKey',
      model: activeModel || modelsToTry()[0],
      lastError,
      lastUsedAt,
    }
  },

  async identify(image: string, catalog: Catalog): Promise<RawSuggestion> {
    const key = apiKey()
    if (!key) throw new Error('GEMINI_API_KEY missing')
    const { mime, base64 } = stripDataUrl(image)
    lastUsedAt = new Date().toISOString()

    const prompt = [
      'Identify the plant in the image for a greenhouse marketplace catalog.',
      'Pick the best matching catalog category and subcategory ids when possible.',
      'Estimate quality (grade), size, stage, and trait option ids only from the allowed enums.',
      'If unsure about a field, use an empty string or omit it.',
      'Set isPlant false when the image is not a plant.',
      '',
      catalogBrief(catalog),
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
        responseSchema: buildSchema(catalog),
      },
    })

    let lastFailure = 'Gemini failed'
    for (const model of modelsToTry()) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`
      try {
        const res = await fetchWithTimeout(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
        })
        if (!res.ok) {
          const text = await res.text().catch(() => '')
          lastFailure = `Gemini HTTP ${res.status}${text ? `: ${text.slice(0, 180)}` : ''}`
          if (RETRYABLE_STATUS.has(res.status)) continue
          break
        }
        const body = (await res.json()) as GeminiBody
        const suggestion = parseGeminiBody(body, catalog)
        activeModel = model
        lastError = undefined
        return suggestion
      } catch (err) {
        if (err instanceof Error && err.name === 'IdentifyTimeoutError') throw err
        lastFailure = err instanceof Error ? err.message : 'Gemini failed'
        break
      }
    }
    lastError = lastFailure
    throw new Error(lastFailure)
  },
}
