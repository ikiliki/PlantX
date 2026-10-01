import type { Catalog, IdentifyMockScenario } from '../../../../../src/mock/types.ts'
import type { GeminiBody, GeminiJson } from '../providers/gemini.ts'
import { NOT_IN_CATALOG, firstOptionId, matchPick } from './catalogPick.ts'

function envelope(json: GeminiJson): GeminiBody {
  const text = JSON.stringify(json)
  const outputTokens = Math.ceil(text.length / 4)
  return {
    candidates: [{ content: { role: 'model', parts: [{ text }] }, finishReason: 'STOP', index: 0 }],
    usageMetadata: { promptTokenCount: 1290, candidatesTokenCount: outputTokens, totalTokenCount: 1290 + outputTokens },
    modelVersion: 'gemini-2.0-flash',
  }
}

function firstTraits(catalog: Catalog): Record<string, string> {
  const traits: Record<string, string> = {}
  for (const prop of catalog.properties) {
    if (['grade', 'size', 'stage', 'area'].includes(prop.id)) continue
    const option = prop.options[0]?.id
    if (option) traits[prop.id] = option
  }
  return traits
}

/** Gemini `generateContent` body whose text follows the provider's `responseSchema`. */
export function geminiMockBody(catalog: Catalog, scenario: IdentifyMockScenario): GeminiBody {
  if (scenario === 'error') {
    throw new Error('Gemini HTTP 503: {"error":{"code":503,"message":"The model is overloaded.","status":"UNAVAILABLE"}} (mock)')
  }
  if (scenario === 'notPlant') {
    return envelope({ isPlant: false, scientificName: '', commonNames: [], probability: 0.97, categoryId: '', subcategoryId: '' })
  }
  if (scenario === 'notInCatalog') {
    return envelope({
      isPlant: true,
      scientificName: NOT_IN_CATALOG.scientificName,
      commonNames: NOT_IN_CATALOG.commonNames,
      genus: NOT_IN_CATALOG.genus,
      cultivar: null,
      probability: 0.9,
      categoryId: '',
      subcategoryId: '',
      quality: '',
      size: '',
      stage: '',
      traits: null,
    })
  }
  const pick = matchPick(catalog)
  return envelope({
    isPlant: true,
    scientificName: pick.scientificName,
    commonNames: [pick.commonName],
    genus: pick.genus,
    cultivar: pick.subcategory?.name ?? null,
    probability: 0.88,
    categoryId: pick.category?.id ?? '',
    subcategoryId: pick.subcategory?.id ?? '',
    quality: firstOptionId(catalog, 'grade'),
    size: firstOptionId(catalog, 'size'),
    stage: firstOptionId(catalog, 'stage'),
    traits: firstTraits(catalog),
  })
}
