import type { Catalog, IdentifyProviderStatus } from '../../../../../src/mock/types.ts'
import { fetchWithTimeout, stripDataUrl } from '../http.ts'
import type { IdentifyProvider, RawSuggestion } from '../types.ts'

const DOCS_URL = 'https://ai.google.dev/gemini-api/docs'
const DEFAULT_MODEL = 'gemini-2.0-flash'

let lastError: string | undefined
let lastUsedAt: string | undefined

function apiKey() {
  return (process.env.GEMINI_API_KEY || '').trim()
}

function modelName() {
  return (process.env.GEMINI_MODEL || '').trim() || DEFAULT_MODEL
}

function optionIds(catalog: Catalog, propertyId: string): string[] {
  const prop = catalog.properties.find((item) => item.id === propertyId)
  return prop?.options.map((opt) => opt.id) ?? []
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
    traitsProperties[id] = {
      type: 'STRING',
      nullable: true,
      enum: [...options, ''],
      description: `Option id for catalog property ${id}`,
    }
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
      categoryId: {
        type: 'STRING',
        nullable: true,
        enum: categoryIds.length ? [...categoryIds, ''] : [''],
        description: 'Best matching catalog category id, or empty',
      },
      subcategoryId: {
        type: 'STRING',
        nullable: true,
        enum: subcategoryIds.length ? [...subcategoryIds, ''] : [''],
        description: 'Best matching catalog subcategory id, or empty',
      },
      quality: {
        type: 'STRING',
        nullable: true,
        enum: grades.length ? [...grades, ''] : [''],
      },
      size: {
        type: 'STRING',
        nullable: true,
        enum: sizes.length ? [...sizes, ''] : [''],
      },
      stage: {
        type: 'STRING',
        nullable: true,
        enum: stages.length ? [...stages, ''] : [''],
      },
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

  async status(): Promise<IdentifyProviderStatus> {
    const key = apiKey()
    return {
      id: 'gemini',
      order: 3,
      name: 'Gemini',
      returns: 'Catalog match plus grade, size, stage, traits',
      docsUrl: DOCS_URL,
      keySet: Boolean(key),
      status: key ? 'ready' : 'missingKey',
      model: modelName(),
      lastError,
      lastUsedAt,
    }
  },

  async identify(image: string, catalog: Catalog): Promise<RawSuggestion> {
    const key = apiKey()
    if (!key) throw new Error('GEMINI_API_KEY missing')
    const { mime, base64 } = stripDataUrl(image)
    const model = modelName()
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`
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

    try {
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                { inlineData: { mimeType: mime, data: base64 } },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: buildSchema(catalog),
          },
        }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        const detail = `Gemini HTTP ${res.status}${text ? `: ${text.slice(0, 180)}` : ''}`
        lastError = detail
        throw new Error(detail)
      }
      const body = (await res.json()) as GeminiBody
      const suggestion = parseGeminiBody(body, catalog)
      lastError = undefined
      return suggestion
    } catch (err) {
      if (!(err instanceof Error && err.name === 'IdentifyTimeoutError')) {
        lastError = err instanceof Error ? err.message : 'Gemini failed'
      }
      throw err
    }
  },
}
