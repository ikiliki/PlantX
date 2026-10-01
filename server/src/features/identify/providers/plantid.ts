import type { Catalog, IdentifyCredits, IdentifyProviderStatus } from '../../../../../src/mock/types.ts'
import { fetchWithTimeout, genusFromScientific, parseCultivar, stripDataUrl } from '../http.ts'
import type { IdentifyProvider, RawSuggestion } from '../types.ts'

const DOCS_URL = 'https://docs.kindwise.com'
const IDENTIFY_URL = 'https://api.plant.id/v3/identification?details=common_names,taxonomy'
const USAGE_URL = 'https://api.plant.id/v3/usage_info'

let lastError: string | undefined
let lastUsedAt: string | undefined

function apiKey() {
  return (process.env.KINDWISE_API_KEY || '').trim()
}

function pickRemaining(remaining: Record<string, number | null | undefined> | undefined) {
  if (!remaining) return undefined
  for (const period of ['day', 'week', 'month', 'total'] as const) {
    const value = remaining[period]
    if (typeof value === 'number') {
      return { remaining: value, period }
    }
  }
  return undefined
}

function pickUsed(used: Record<string, number | null | undefined> | undefined, period?: string) {
  if (!used || !period) return undefined
  const value = used[period]
  return typeof value === 'number' ? value : undefined
}

function pickTotal(limits: Record<string, number | null | undefined> | undefined, period?: string) {
  if (!limits || !period) return undefined
  const value = limits[period]
  return typeof value === 'number' ? value : undefined
}

async function usageCredits(): Promise<{
  status: IdentifyProviderStatus['status']
  credits?: IdentifyCredits
  detail?: string
}> {
  const key = apiKey()
  if (!key) return { status: 'missingKey' }
  try {
    const res = await fetchWithTimeout(USAGE_URL, {
      headers: { 'Api-Key': key },
    })
    if (!res.ok) {
      const detail = `usage_info HTTP ${res.status}`
      lastError = detail
      return { status: 'unreachable', detail }
    }
    const body = (await res.json()) as {
      can_use_credits?: { value?: boolean; reason?: string | null }
      remaining?: Record<string, number | null>
      used?: Record<string, number | null>
      credit_limits?: Record<string, number | null>
    }
    const picked = pickRemaining(body.remaining)
    const credits: IdentifyCredits | undefined = picked
      ? {
          remaining: picked.remaining,
          period: picked.period,
          used: pickUsed(body.used, picked.period),
          total: pickTotal(body.credit_limits, picked.period),
        }
      : undefined
    const canUse = body.can_use_credits?.value !== false
    const exhausted =
      !canUse || (typeof credits?.remaining === 'number' && credits.remaining <= 0)
    if (exhausted) {
      return {
        status: 'exhausted',
        credits,
        detail: body.can_use_credits?.reason || 'No credits remaining',
      }
    }
    return { status: 'ready', credits }
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'usage_info failed'
    lastError = detail
    return { status: 'unreachable', detail }
  }
}

/** The fields of a v3 `/identification` response that the parser reads. */
export type PlantidBody = {
  result?: {
    is_plant?: { binary?: boolean; probability?: number; threshold?: number }
    classification?: {
      suggestions?: Array<{
        id?: string
        name?: string
        probability?: number
        details?: {
          common_names?: string[] | null
          taxonomy?: { genus?: string | null; family?: string | null } | null
        }
      }>
    }
  }
}

export function parsePlantidBody(body: PlantidBody, _catalog: Catalog): RawSuggestion {
  const isPlant = Boolean(body.result?.is_plant?.binary)
  const top = body.result?.classification?.suggestions?.[0]
  const scientificName = (top?.name || '').trim()
  const commonNames = (top?.details?.common_names || []).filter(Boolean)
  const genus =
    top?.details?.taxonomy?.genus?.trim() ||
    (scientificName ? genusFromScientific(scientificName) : undefined)
  const cultivar = scientificName ? parseCultivar(scientificName) : undefined
  const probability = typeof top?.probability === 'number' ? top.probability : 0
  const label =
    commonNames[0] ||
    scientificName ||
    (isPlant ? 'Unknown plant' : 'Not a plant')

  return {
    provider: 'plantid',
    label,
    scientificName,
    commonNames,
    genus,
    cultivar,
    probability,
    isPlant,
  }
}

export const plantidProvider: IdentifyProvider = {
  id: 'plantid',
  order: 1,

  async status(): Promise<IdentifyProviderStatus> {
    const key = apiKey()
    const base = {
      id: 'plantid' as const,
      order: 1,
      name: 'Plant.id',
      returns: 'Species, cultivar, common names',
      docsUrl: DOCS_URL,
      keySet: Boolean(key),
      lastError,
      lastUsedAt,
    }
    if (!key) return { ...base, status: 'missingKey' }
    const usage = await usageCredits()
    return {
      ...base,
      status: usage.status,
      credits: usage.credits,
      lastError: usage.status === 'unreachable' ? usage.detail || lastError : lastError,
    }
  },

  async identify(image: string, catalog: Catalog): Promise<RawSuggestion> {
    const key = apiKey()
    if (!key) throw new Error('KINDWISE_API_KEY missing')
    const { base64 } = stripDataUrl(image)
    lastUsedAt = new Date().toISOString()
    try {
      const res = await fetchWithTimeout(IDENTIFY_URL, {
        method: 'POST',
        headers: {
          'Api-Key': key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: [base64],
          classification_level: 'all',
        }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        const detail = `Plant.id HTTP ${res.status}${text ? `: ${text.slice(0, 180)}` : ''}`
        lastError = detail
        throw new Error(detail)
      }
      const body = (await res.json()) as PlantidBody
      lastError = undefined
      return parsePlantidBody(body, catalog)
    } catch (err) {
      if (!(err instanceof Error && err.name === 'IdentifyTimeoutError')) {
        lastError = err instanceof Error ? err.message : 'Plant.id failed'
      }
      throw err
    }
  },
}
