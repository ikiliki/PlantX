import type { Catalog, IdentifyCredits, IdentifyProviderStatus } from '../../../../../src/mock/types.ts'
import {
  fetchWithTimeout,
  genusFromScientific,
  parseCultivar,
  stripDataUrl,
} from '../http.ts'
import type { IdentifyProvider, RawSuggestion } from '../types.ts'

const DOCS_URL = 'https://my.plantnet.org/doc/api/identify'
const IDENTIFY_URL = 'https://my-api.plantnet.org/v2/identify/all'
const QUOTA_URL = 'https://my-api.plantnet.org/v2/quota/daily'

let lastError: string | undefined
let lastUsedAt: string | undefined

function apiKey() {
  return (process.env.PLANTNET_API_KEY || '').trim()
}

function withKey(url: string) {
  const key = apiKey()
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}api-key=${encodeURIComponent(key)}`
}

async function dailyQuota(): Promise<{
  status: IdentifyProviderStatus['status']
  credits?: IdentifyCredits
  detail?: string
}> {
  const key = apiKey()
  if (!key) return { status: 'missingKey' }
  try {
    const res = await fetchWithTimeout(withKey(QUOTA_URL))
    if (!res.ok) {
      const detail = `quota/daily HTTP ${res.status}`
      lastError = detail
      return { status: 'unreachable', detail }
    }
    const body = (await res.json()) as {
      quota?: {
        identify?: { count?: number; total?: number; remaining?: number }
      }
    }
    const identify = body.quota?.identify
    const credits: IdentifyCredits = {
      remaining: identify?.remaining,
      used: identify?.count,
      total: identify?.total,
      period: 'day',
    }
    if (typeof credits.remaining === 'number' && credits.remaining <= 0) {
      return { status: 'exhausted', credits, detail: 'Daily identify quota exhausted' }
    }
    return { status: 'ready', credits }
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'quota failed'
    lastError = detail
    return { status: 'unreachable', detail }
  }
}

function dataUrlToFile(image: string): File {
  const { mime, base64 } = stripDataUrl(image)
  const bytes = Buffer.from(base64, 'base64')
  const ext = mime.includes('png') ? 'png' : 'jpg'
  return new File([bytes], `plant.${ext}`, { type: mime })
}

/** The fields of a v2 `/identify/all` response that the parser reads. */
export type PlantnetBody = {
  bestMatch?: string
  results?: Array<{
    score?: number
    species?: {
      scientificNameWithoutAuthor?: string
      scientificNameAuthorship?: string
      scientificName?: string
      commonNames?: string[]
      genus?: { scientificNameWithoutAuthor?: string; scientificName?: string }
      family?: { scientificNameWithoutAuthor?: string; scientificName?: string }
    }
  }>
  remainingIdentificationRequests?: number
}

export function parsePlantnetBody(body: PlantnetBody, _catalog: Catalog): RawSuggestion {
  const top = body.results?.[0]
  const scientificName = (
    top?.species?.scientificNameWithoutAuthor ||
    top?.species?.scientificName ||
    ''
  ).trim()
  const commonNames = (top?.species?.commonNames || []).filter(Boolean)
  const genus =
    top?.species?.genus?.scientificNameWithoutAuthor?.trim() ||
    top?.species?.genus?.scientificName?.trim() ||
    (scientificName ? genusFromScientific(scientificName) : undefined)
  const cultivar = scientificName ? parseCultivar(scientificName) : undefined
  const probability = typeof top?.score === 'number' ? top.score : 0
  const isPlant = Boolean(top && scientificName)
  const label = commonNames[0] || scientificName || (isPlant ? 'Unknown plant' : 'Not a plant')

  return {
    provider: 'plantnet',
    label,
    scientificName,
    commonNames,
    genus,
    cultivar,
    probability,
    isPlant,
  }
}

export const plantnetProvider: IdentifyProvider = {
  id: 'plantnet',
  order: 2,

  async status(): Promise<IdentifyProviderStatus> {
    const key = apiKey()
    const base = {
      id: 'plantnet' as const,
      order: 2,
      name: 'Pl@ntNet',
      returns: 'Species, genus, common names',
      docsUrl: DOCS_URL,
      keySet: Boolean(key),
      lastError,
      lastUsedAt,
    }
    if (!key) return { ...base, status: 'missingKey' }
    const quota = await dailyQuota()
    return {
      ...base,
      status: quota.status,
      credits: quota.credits,
      lastError: quota.status === 'unreachable' ? quota.detail || lastError : lastError,
    }
  },

  async identify(image: string, catalog: Catalog): Promise<RawSuggestion> {
    const key = apiKey()
    if (!key) throw new Error('PLANTNET_API_KEY missing')
    lastUsedAt = new Date().toISOString()
    try {
      const form = new FormData()
      form.append('images', dataUrlToFile(image))
      form.append('organs', 'auto')
      const res = await fetchWithTimeout(withKey(IDENTIFY_URL), {
        method: 'POST',
        body: form,
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        const detail = `Pl@ntNet HTTP ${res.status}${text ? `: ${text.slice(0, 180)}` : ''}`
        lastError = detail
        throw new Error(detail)
      }
      const body = (await res.json()) as PlantnetBody
      lastError = undefined
      return parsePlantnetBody(body, catalog)
    } catch (err) {
      if (!(err instanceof Error && err.name === 'IdentifyTimeoutError')) {
        lastError = err instanceof Error ? err.message : 'Pl@ntNet failed'
      }
      throw err
    }
  },
}
