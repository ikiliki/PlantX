import type {
  IdentifyMockScenario,
  IdentifyMode,
  IdentifyProviderId,
  IdentifyRequestStatus,
  IdentifySkipReason,
  IdentifySource,
  IdentifyTarget,
  Locale,
} from '../../mock/types'

export const providerNameKey = {
  plantid: 'apisProviderPlantid',
  plantnet: 'apisProviderPlantnet',
  gemini: 'apisProviderGemini',
} as const satisfies Record<IdentifyProviderId, string>

export const targetLabelKey = {
  chain: 'apisTargetChain',
  ...providerNameKey,
} as const satisfies Record<IdentifyTarget, string>

export const modeLabelKey = {
  mock: 'apisModeMock',
  live: 'apisModeLive',
} as const satisfies Record<IdentifyMode, string>

export const modeHintKey = {
  mock: 'apisModeMockHint',
  live: 'apisModeLiveHint',
} as const satisfies Record<IdentifyMode, string>

export const scenarioLabelKey = {
  match: 'apisScenarioMatch',
  notInCatalog: 'apisScenarioNotInCatalog',
  notPlant: 'apisScenarioNotPlant',
  error: 'apisScenarioError',
} as const satisfies Record<IdentifyMockScenario, string>

export const skipLabelKey = {
  missingKey: 'apisSkipMissingKey',
  exhausted: 'apisSkipExhausted',
  error: 'apisSkipError',
  timeout: 'apisSkipTimeout',
} as const satisfies Record<IdentifySkipReason, string>

export const sourceLabelKey = {
  addPlant: 'apisSourceAddPlant',
  playground: 'apisSourcePlayground',
} as const satisfies Record<IdentifySource, string>

export const requestStatusKey = {
  ok: 'apisStatusOk',
  unavailable: 'apisUnavailable',
} as const satisfies Record<IdentifyRequestStatus, string>

export const identifyTargets: IdentifyTarget[] = ['chain', 'plantid', 'plantnet', 'gemini']
export const identifyScenarios: IdentifyMockScenario[] = ['match', 'notInCatalog', 'notPlant', 'error']

export function modeTone(mode: IdentifyMode) {
  return mode === 'live' ? ('warn' as const) : ('muted' as const)
}

export function requestStatusTone(status: IdentifyRequestStatus) {
  return status === 'ok' ? ('lime' as const) : ('danger' as const)
}

export function formatWhen(iso: string | undefined, locale: Locale) {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString(locale === 'he' ? 'he-IL' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
