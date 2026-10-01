import type {
  Catalog,
  Diagnosis,
  IdentifyMockScenario,
  IdentifyMode,
  IdentifyRequestRecord,
  IdentifySource,
  IdentifyTarget,
  IdentifyTried,
} from '../../../../src/mock/types.ts'
import { getStore } from '../../db/index.ts'
import { AppError } from '../../lib/errors.ts'
import { logger } from '../../lib/logger.ts'
import { catalogService } from '../catalog/catalog.service.ts'
import { IdentifyTimeoutError } from './http.ts'
import { mapDiagnosis } from './mapDiagnosis.ts'
import { mockIdentify } from './mock/index.ts'
import { geminiProvider } from './providers/gemini.ts'
import { plantidProvider } from './providers/plantid.ts'
import { plantnetProvider } from './providers/plantnet.ts'
import type { IdentifyProvider, RawSuggestion } from './types.ts'

/** Only this module knows the fallback order. */
const CHAIN: IdentifyProvider[] = [plantidProvider, plantnetProvider, geminiProvider]

const MAX_THUMB_LENGTH = 40_000

export type IdentifyRun = {
  mode: IdentifyMode
  target: IdentifyTarget
  scenario?: IdentifyMockScenario
}

export type IdentifyRequester = {
  userId: string
  source: IdentifySource
  thumb?: string
}

export type IdentifyOutcome =
  | { ok: true; diagnosis: Diagnosis; record: IdentifyRequestRecord }
  | { ok: false; tried: IdentifyTried[]; record: IdentifyRequestRecord }

export class IdentifyUnavailableError extends AppError {
  readonly tried: IdentifyTried[]

  constructor(tried: IdentifyTried[]) {
    super(503, 'unavailable', 'No identify provider available')
    this.name = 'IdentifyUnavailableError'
    this.tried = tried
  }
}

function toTried(
  provider: IdentifyProvider,
  reason: IdentifyTried['reason'],
  detail?: string,
): IdentifyTried {
  return detail ? { provider: provider.id, reason, detail } : { provider: provider.id, reason }
}

function providersFor(target: IdentifyTarget) {
  return target === 'chain' ? CHAIN : CHAIN.filter((provider) => provider.id === target)
}

/** Live only: returns a skip entry when the provider cannot be called. */
async function liveSkip(provider: IdentifyProvider): Promise<IdentifyTried | undefined> {
  const status = await provider.status()
  if (status.status === 'missingKey') return toTried(provider, 'missingKey')
  if (status.status === 'exhausted') return toTried(provider, 'exhausted', 'No credits or quota remaining')
  return undefined
}

function call(provider: IdentifyProvider, image: string, catalog: Catalog, run: IdentifyRun) {
  return run.mode === 'mock'
    ? mockIdentify(provider.id, catalog, run.scenario ?? 'match')
    : provider.identify(image, catalog)
}

function toDiagnosis(raw: RawSuggestion, catalog: Catalog, mode: IdentifyMode, tried: IdentifyTried[]): Diagnosis {
  return {
    provider: raw.provider,
    mode,
    label: raw.label,
    scientificName: raw.scientificName,
    commonNames: raw.commonNames,
    probability: raw.probability,
    isPlant: raw.isPlant,
    draft: mapDiagnosis(raw, catalog),
    tried,
  }
}

function keptThumb(thumb: string | undefined) {
  if (!thumb || !/^data:image\//i.test(thumb) || thumb.length > MAX_THUMB_LENGTH) return undefined
  return thumb
}

function requestId() {
  return `idr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

async function saveRecord(record: IdentifyRequestRecord) {
  try {
    await getStore().identifyRequests.add(record)
  } catch (err) {
    logger.error('identify history save failed', { id: record.id }, err)
  }
}

export const identifyService = {
  async providersStatus() {
    return Promise.all(CHAIN.map((provider) => provider.status()))
  },

  async diagnose(image: string, run: IdentifyRun): Promise<Diagnosis> {
    const catalog = await catalogService.get()
    const tried: IdentifyTried[] = []

    for (const provider of providersFor(run.target)) {
      if (run.mode === 'live') {
        const skip = await liveSkip(provider)
        if (skip) {
          tried.push(skip)
          continue
        }
      }

      try {
        const raw = await call(provider, image, catalog, run)
        return toDiagnosis(raw, catalog, run.mode, tried)
      } catch (err) {
        if (err instanceof IdentifyTimeoutError) {
          tried.push(toTried(provider, 'timeout', err.message))
          continue
        }
        const detail = err instanceof Error ? err.message : 'Provider failed'
        tried.push(toTried(provider, 'error', detail))
      }
    }

    throw new IdentifyUnavailableError(tried)
  },

  /** Diagnose, then persist the request whether or not a provider answered. */
  async identify(image: string, run: IdentifyRun, requester: IdentifyRequester): Promise<IdentifyOutcome> {
    const started = Date.now()
    let diagnosis: Diagnosis | undefined
    let tried: IdentifyTried[]
    try {
      diagnosis = await identifyService.diagnose(image, run)
      tried = diagnosis.tried
    } catch (err) {
      if (!(err instanceof IdentifyUnavailableError)) throw err
      tried = err.tried
    }

    const record: IdentifyRequestRecord = {
      id: requestId(),
      createdAt: new Date().toISOString(),
      userId: requester.userId,
      source: requester.source,
      mode: run.mode,
      target: run.target,
      status: diagnosis ? 'ok' : 'unavailable',
      durationMs: Date.now() - started,
      tried,
    }
    if (run.mode === 'mock') record.scenario = run.scenario ?? 'match'
    const thumb = keptThumb(requester.thumb)
    if (thumb) record.thumb = thumb
    if (diagnosis) record.diagnosis = diagnosis
    await saveRecord(record)

    return diagnosis ? { ok: true, diagnosis, record } : { ok: false, tried, record }
  },

  history(query: { mode?: IdentifyMode; limit: number }) {
    return getStore().identifyRequests.list(query)
  },
}
