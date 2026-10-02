import { defaultIdentifySettings } from '../../../../src/mock/identifySettings.ts'
import type {
  Catalog,
  CatalogSuggestion,
  Diagnosis,
  IdentifyMockScenario,
  IdentifyMode,
  IdentifyProviderId,
  IdentifyProviderSettings,
  IdentifyProviderStatus,
  IdentifyRequestRecord,
  IdentifySource,
  IdentifyStep,
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
import type { MockPlan } from './mock/applyPlan.ts'
import { mockIdentify } from './mock/index.ts'
import type { CatalogDraftHint } from '../catalog/catalogDraft.ts'
import { draftCatalogEntry, draftPlantClass, gatePlant, geminiProvider, guessPlantSize, type SpeciesHint } from './providers/gemini.ts'
import { plantnetProvider } from './providers/plantnet.ts'
import type { IdentifyProvider, RawSuggestion } from './types.ts'

/** Admin status order. The pipeline itself is gate, then species, then draft. */
const PROVIDERS: IdentifyProvider[] = [geminiProvider, plantnetProvider]

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
  readonly steps: IdentifyStep[]

  constructor(tried: IdentifyTried[], steps: IdentifyStep[] = []) {
    super(503, 'unavailable', 'No identify provider available')
    this.name = 'IdentifyUnavailableError'
    this.tried = tried
    this.steps = steps
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
  return target === 'chain' ? PROVIDERS : PROVIDERS.filter((provider) => provider.id === target)
}

/** Live only: returns a skip entry when the provider cannot be called. */
async function liveSkip(provider: IdentifyProvider): Promise<IdentifyTried | undefined> {
  const status = await provider.status()
  if (status.status === 'missingKey') return toTried(provider, 'missingKey')
  if (status.status === 'exhausted') return toTried(provider, 'exhausted', 'No credits or quota remaining')
  return undefined
}

function settingsFor(
  flags: Partial<Record<IdentifyProviderId, IdentifyProviderSettings>>,
  id: IdentifyProviderId,
) {
  return flags[id] ?? defaultIdentifySettings(true)
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
  flags: Partial<Record<IdentifyProviderId, IdentifyProviderSettings>>,
): Promise<IdentifyProviderStatus> {
  return { ...(await provider.status()), ...settingsFor(flags, provider.id) }
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

type SettingsFlags = Partial<Record<IdentifyProviderId, IdentifyProviderSettings>>

type DiagnoseCtx = {
  image: string
  catalog: Catalog
  run: IdentifyRun
  flags: SettingsFlags
  suggestionById: (id: string) => Promise<CatalogSuggestion | null>
}

function wantsMock(run: IdentifyRun, settings: IdentifyProviderSettings) {
  return run.honorEnabled ? settings.response === 'mock' : run.mode === 'mock'
}

function scenarioOf(run: IdentifyRun, settings: IdentifyProviderSettings, useMock: boolean): IdentifyMockScenario {
  if (!useMock) return 'match'
  return run.honorEnabled ? settings.scenario : (run.scenario ?? 'match')
}

function failedTry(provider: IdentifyProvider, err: unknown): IdentifyTried {
  if (err instanceof IdentifyTimeoutError) return toTried(provider, 'timeout', err.message)
  const detail = err instanceof Error ? err.message : 'Provider failed'
  return toTried(provider, 'error', detail)
}

function speciesOf(raw: RawSuggestion): SpeciesHint {
  return {
    label: raw.label,
    scientificName: raw.scientificName,
    commonNames: raw.commonNames,
    genus: raw.genus,
    cultivar: raw.cultivar,
    probability: raw.probability,
  }
}

/** Catalog ids only, then size when the draft left it empty, then a suggestion when nothing matched. */
async function settle(
  raw: RawSuggestion,
  ctx: DiagnoseCtx,
  tried: IdentifyTried[],
  mode: IdentifyMode,
  useMock: boolean,
  scenario: IdentifyMockScenario,
  settings: IdentifyProviderSettings,
  steps?: IdentifyStep[],
) {
  const diagnosis = toDiagnosis(raw, ctx.catalog, mode, tried)
  if (steps) diagnosis.steps = steps
  const adminMock = Boolean(ctx.run.honorEnabled && useMock && (scenario === 'match' || scenario === 'notInCatalog'))
  if (useMock && scenario === 'notInCatalog') {
    diagnosis.draft = {}
  } else if (useMock && ctx.run.honorEnabled && scenario === 'match' && !settings.match.subcategory) {
    delete diagnosis.draft.subcategoryId
  }
  if (!adminMock && raw.isPlant && !diagnosis.draft.size) {
    const guessed = useMock
      ? ctx.catalog.properties.find((item) => item.id === 'size')?.options[0]?.id
      : await guessPlantSize(ctx.image, ctx.catalog).catch(() => undefined)
    if (guessed && ctx.catalog.properties.some((item) => item.id === 'size' && item.options.some((opt) => opt.id === guessed))) {
      diagnosis.draft.size = guessed as SizeBand
    }
  }
  if (!useMock && raw.isPlant && !diagnosis.draft.categoryId) {
    noteMissingCategory(raw, ctx.image, ctx.catalog)
  }
  return { diagnosis, scenario: useMock ? scenario : undefined }
}

/** Playground test of one provider. */
async function diagnoseOne(ctx: DiagnoseCtx): Promise<{ diagnosis: Diagnosis; scenario?: IdentifyMockScenario }> {
  const tried: IdentifyTried[] = []
  for (const provider of providersFor(ctx.run.target)) {
    const settings = settingsFor(ctx.flags, provider.id)
    if (ctx.run.honorEnabled && !settings.enabled) {
      tried.push(toTried(provider, 'disabled'))
      continue
    }
    const useMock = wantsMock(ctx.run, settings)
    const scenario = scenarioOf(ctx.run, settings, useMock)
    if (!useMock) {
      const skip = await liveSkip(provider)
      if (skip) {
        tried.push(skip)
        continue
      }
    }
    try {
      const plan: MockPlan | undefined =
        useMock && ctx.run.honorEnabled
          ? {
              match: scenario === 'match' ? settings.match : undefined,
              suggestion: scenario === 'notInCatalog' ? await ctx.suggestionById(settings.suggestionId) : undefined,
            }
          : undefined
      const raw = useMock
        ? await mockIdentify(provider.id, ctx.catalog, scenario, plan)
        : await provider.identify(ctx.image, ctx.catalog)
      return settle(raw, ctx, tried, useMock ? 'mock' : 'live', useMock, scenario, settings)
    } catch (err) {
      tried.push(failedTry(provider, err))
    }
  }
  throw new IdentifyUnavailableError(tried)
}

/**
 * Add Plant pipeline.
 * Gemini gate first. A non-plant stops before Pl@ntNet.
 * Pl@ntNet names the species. Gemini then fills catalog fields from that JSON,
 * the photo, and the catalog as it is right now.
 */
async function diagnosePipeline(ctx: DiagnoseCtx): Promise<{ diagnosis: Diagnosis; scenario?: IdentifyMockScenario }> {
  const tried: IdentifyTried[] = []
  const steps: IdentifyStep[] = []
  let sawLive = false
  const geminiSettings = settingsFor(ctx.flags, 'gemini')
  const geminiMock = wantsMock(ctx.run, geminiSettings)
  const geminiScenario = scenarioOf(ctx.run, geminiSettings, geminiMock)

  if (ctx.run.honorEnabled && !geminiSettings.enabled) {
    tried.push(toTried(geminiProvider, 'disabled'))
    steps.push({ id: 'gate', provider: 'gemini', ok: false, detail: 'disabled' })
    throw new IdentifyUnavailableError(tried, steps)
  }
  if (!geminiMock) {
    const skip = await liveSkip(geminiProvider)
    if (skip) {
      tried.push(skip)
      steps.push({ id: 'gate', provider: 'gemini', ok: false, detail: skip.detail ?? skip.reason })
      throw new IdentifyUnavailableError(tried, steps)
    }
  }

  let gatePlantAnswer = true
  try {
    if (geminiMock) {
      const gated = await mockIdentify('gemini', ctx.catalog, geminiScenario)
      gatePlantAnswer = gated.isPlant
    } else {
      sawLive = true
      gatePlantAnswer = await gatePlant(ctx.image)
    }
  } catch (err) {
    const fail = failedTry(geminiProvider, err)
    tried.push(fail)
    steps.push({ id: 'gate', provider: 'gemini', ok: false, detail: fail.detail })
    throw new IdentifyUnavailableError(tried, steps)
  }

  steps.push({ id: 'gate', provider: 'gemini', ok: true, isPlant: gatePlantAnswer })
  if (!gatePlantAnswer) {
    const raw: RawSuggestion = {
      provider: 'gemini',
      label: 'Not a plant',
      scientificName: '',
      commonNames: [],
      probability: 0,
      isPlant: false,
    }
    return settle(raw, ctx, tried, geminiMock ? 'mock' : 'live', geminiMock, geminiScenario, geminiSettings, steps)
  }

  const plantnetSettings = settingsFor(ctx.flags, 'plantnet')
  const plantnetMock = wantsMock(ctx.run, plantnetSettings)
  const plantnetScenario = scenarioOf(ctx.run, plantnetSettings, plantnetMock)
  let species: RawSuggestion | null = null
  if (ctx.run.honorEnabled && !plantnetSettings.enabled) {
    const skip = toTried(plantnetProvider, 'disabled')
    tried.push(skip)
    steps.push({ id: 'species', provider: 'plantnet', ok: false, detail: 'disabled' })
  } else if (!plantnetMock) {
    const skip = await liveSkip(plantnetProvider)
    if (skip) {
      tried.push(skip)
      steps.push({ id: 'species', provider: 'plantnet', ok: false, detail: skip.detail ?? skip.reason })
    } else {
      try {
        sawLive = true
        species = await plantnetProvider.identify(ctx.image, ctx.catalog)
      } catch (err) {
        const fail = failedTry(plantnetProvider, err)
        tried.push(fail)
        steps.push({ id: 'species', provider: 'plantnet', ok: false, detail: fail.detail })
      }
    }
  } else {
    try {
      const plan: MockPlan | undefined =
        ctx.run.honorEnabled
          ? {
              match: plantnetScenario === 'match' ? plantnetSettings.match : undefined,
              suggestion:
                plantnetScenario === 'notInCatalog' ? await ctx.suggestionById(plantnetSettings.suggestionId) : undefined,
            }
          : undefined
      species = await mockIdentify('plantnet', ctx.catalog, plantnetScenario, plan)
    } catch (err) {
      const fail = failedTry(plantnetProvider, err)
      tried.push(fail)
      steps.push({ id: 'species', provider: 'plantnet', ok: false, detail: fail.detail })
    }
  }
  if (species) {
    steps.push({
      id: 'species',
      provider: 'plantnet',
      ok: species.isPlant,
      isPlant: species.isPlant,
      label: species.label,
      scientificName: species.scientificName,
      probability: species.probability,
    })
  }

  try {
    const plan: MockPlan | undefined =
      geminiMock && ctx.run.honorEnabled
        ? {
            match: geminiScenario === 'match' ? geminiSettings.match : undefined,
            suggestion:
              geminiScenario === 'notInCatalog' ? await ctx.suggestionById(geminiSettings.suggestionId) : undefined,
          }
        : undefined
    const raw = geminiMock
      ? await mockIdentify('gemini', ctx.catalog, geminiScenario, plan)
      : await draftPlantClass(ctx.image, ctx.catalog, species && species.isPlant ? speciesOf(species) : null)
    if (!geminiMock) sawLive = true
    steps.push({
      id: 'draft',
      provider: 'gemini',
      ok: true,
      isPlant: raw.isPlant,
      label: raw.label,
      scientificName: raw.scientificName,
      probability: raw.probability,
    })
    const mode: IdentifyMode = sawLive ? 'live' : 'mock'
    return settle(raw, ctx, tried, mode, geminiMock, geminiScenario, geminiSettings, steps)
  } catch (err) {
    const fail = failedTry(geminiProvider, err)
    tried.push(fail)
    steps.push({ id: 'draft', provider: 'gemini', ok: false, detail: fail.detail })
    throw new IdentifyUnavailableError(tried, steps)
  }
}

export const identifyService = {
  async providersStatus(): Promise<IdentifyProviderStatus[]> {
    const flags = await enabledFlags()
    return Promise.all(PROVIDERS.map((provider) => statusOf(provider, flags)))
  },

  async saveSettings(id: IdentifyProviderId, patch: Partial<IdentifyProviderSettings>): Promise<IdentifyProviderStatus> {
    const provider = PROVIDERS.find((item) => item.id === id)
    if (!provider) throw Errors.missing(`Unknown provider ${id}`)
    await getStore().identifySettings.save(id, patch)
    return statusOf(provider, await enabledFlags())
  },

  async diagnose(image: string, run: IdentifyRun): Promise<{ diagnosis: Diagnosis; scenario?: IdentifyMockScenario }> {
    const catalog = await catalogService.get()
    const flags = run.honorEnabled ? await enabledFlags() : {}
    let suggestions: Promise<CatalogSuggestion[]> | undefined
    const suggestionById = async (id: string) => {
      if (!id) return null
      suggestions ??= getStore().catalogSuggestions.list('all').catch(() => [])
      const rows = await suggestions
      return rows.find((row) => row.id === id) ?? null
    }
    const ctx: DiagnoseCtx = { image, catalog, run, flags, suggestionById }
    if (run.target === 'chain') return diagnosePipeline(ctx)
    return diagnoseOne(ctx)
  },

  /** Diagnose, then persist the request whether or not a provider answered. */
  async identify(image: string, run: IdentifyRun, requester: IdentifyRequester): Promise<IdentifyOutcome> {
    const started = Date.now()
    let diagnosis: Diagnosis | undefined
    let answeredScenario: IdentifyMockScenario | undefined
    let tried: IdentifyTried[]
    let steps: IdentifyStep[] = []
    try {
      const answered = await identifyService.diagnose(image, run)
      diagnosis = answered.diagnosis
      answeredScenario = answered.scenario
      tried = diagnosis.tried
      steps = diagnosis.steps ?? []
    } catch (err) {
      if (!(err instanceof IdentifyUnavailableError)) throw err
      tried = err.tried
      steps = err.steps
    }

    const record: IdentifyRequestRecord = {
      id: requestId(),
      createdAt: new Date().toISOString(),
      userId: requester.userId,
      source: requester.source,
      mode: diagnosis?.mode ?? run.mode,
      target: run.target,
      status: diagnosis ? 'ok' : 'unavailable',
      durationMs: Date.now() - started,
      tried,
    }
    if (run.mode === 'mock') record.scenario = run.scenario ?? 'match'
    else if (answeredScenario) record.scenario = answeredScenario
    const thumb = keptThumb(requester.thumb)
    if (thumb) record.thumb = thumb
    if (diagnosis) record.diagnosis = diagnosis
    if (steps.length) record.steps = steps
    await saveRecord(record)

    return diagnosis ? { ok: true, diagnosis, record } : { ok: false, tried, record }
  },

  history(query: { mode?: IdentifyMode; limit: number }) {
    return getStore().identifyRequests.list(query)
  },
}
