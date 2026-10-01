import type {
  Catalog,
  Diagnosis,
  IdentifyMockScenario,
  IdentifyMode,
  IdentifyProviderId,
  IdentifyProviderStatus,
  IdentifyRequestRecord,
  IdentifySource,
  IdentifyTarget,
  IdentifyTried,
  SizeBand,
} from '../../../../src/mock/types.ts'
import { getStore } from '../../db/index.ts'
import { AppError, Errors } from '../../lib/errors.ts'
import { logger } from '../../lib/logger.ts'
import { catalogService } from '../catalog/catalog.service.ts'
import { IdentifyTimeoutError } from './http.ts'
import { mapDiagnosis } from './mapDiagnosis.ts'
import { mockIdentify } from './mock/index.ts'
import type { CatalogDraftHint } from '../catalog/catalogDraft.ts'
import { draftCatalogEntry, geminiProvider, guessPlantSize } from './providers/gemini.ts'
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
  /** Add Plant skips providers the admin switched off. The playground leaves this unset. */
  honorEnabled?: boolean
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

function enabledFlags() {
  return getStore().identifySettings.get()
}

async function statusOf(
  provider: IdentifyProvider,
  flags: Partial<Record<IdentifyProviderId, boolean>>,
): Promise<IdentifyProviderStatus> {
  return { ...(await provider.status()), enabled: flags[provider.id] ?? true }
}

/** Add Plant and the admin playground share this on a live answer. Mock runs do not file a row. */
function noteMissingCategory(raw: RawSuggestion, image: string, catalog: Catalog) {
  const name = raw.commonNames.find(Boolean) || raw.scientificName || raw.genus || ''
  if (!name.trim()) return
  const hint: CatalogDraftHint = {
    name: name.trim(),
    scientificName: raw.scientificName.trim(),
    genus: raw.genus?.trim() || '',
    commonNames: raw.commonNames.filter(Boolean).slice(0, 6),
    provider: raw.provider,
    cultivar: raw.cultivar,
    photo: image,
    takenSigns: catalog.properties.map((item) => item.sign).filter(Boolean),
  }
  void draftCatalogEntry(image, hint)
    .then((draft) =>
      getStore().catalogSuggestions.suggest({
        name: hint.name,
        scientificName: hint.scientificName,
        genus: hint.genus,
        commonNames: hint.commonNames,
        provider: hint.provider,
        draft,
      }),
    )
    .catch((err) => logger.warn('catalog suggestion skipped', undefined, err))
}

export const identifyService = {
  async providersStatus(): Promise<IdentifyProviderStatus[]> {
    const flags = await enabledFlags()
    return Promise.all(CHAIN.map((provider) => statusOf(provider, flags)))
  },

  async setEnabled(id: IdentifyProviderId, enabled: boolean): Promise<IdentifyProviderStatus> {
    const provider = CHAIN.find((item) => item.id === id)
    if (!provider) throw Errors.missing(`Unknown provider ${id}`)
    await getStore().identifySettings.save(id, enabled)
    return statusOf(provider, await enabledFlags())
  },

  async diagnose(image: string, run: IdentifyRun): Promise<Diagnosis> {
    const catalog = await catalogService.get()
    const tried: IdentifyTried[] = []
    const flags = run.honorEnabled ? await enabledFlags() : {}

    for (const provider of providersFor(run.target)) {
      if (flags[provider.id] === false) {
        tried.push(toTried(provider, 'disabled'))
        continue
      }
      if (run.mode === 'live') {
        const skip = await liveSkip(provider)
        if (skip) {
          tried.push(skip)
          continue
        }
      }

      try {
        const raw = await call(provider, image, catalog, run)
        const diagnosis = toDiagnosis(raw, catalog, run.mode, tried)
        if (raw.isPlant && !diagnosis.draft.size) {
          const guessed =
            run.mode === 'mock'
              ? catalog.properties.find((item) => item.id === 'size')?.options[0]?.id
              : await guessPlantSize(image, catalog).catch(() => undefined)
          if (guessed && catalog.properties.some((item) => item.id === 'size' && item.options.some((opt) => opt.id === guessed))) {
            diagnosis.draft.size = guessed as SizeBand
          }
        }
        if (run.mode === 'live' && raw.isPlant && !diagnosis.draft.categoryId) {
          noteMissingCategory(raw, image, catalog)
        }
        return diagnosis
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
