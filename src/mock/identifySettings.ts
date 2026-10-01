import type {
  IdentifyMockMatch,
  IdentifyMockScenario,
  IdentifyProviderSettings,
  IdentifyResponseMode,
} from './types'

const SCENARIOS: IdentifyMockScenario[] = ['match', 'notInCatalog', 'notPlant', 'error']

export function emptyIdentifyMatch(): IdentifyMockMatch {
  return { categoryId: '', subcategory: true, subcategoryId: '', properties: {} }
}

/** No saved row: Add Plant uses the real API. */
export function defaultIdentifySettings(enabled = true): IdentifyProviderSettings {
  return {
    enabled,
    response: 'ready',
    scenario: 'match',
    match: emptyIdentifyMatch(),
    suggestionId: '',
  }
}

function matchOf(value: unknown): IdentifyMockMatch {
  const match = emptyIdentifyMatch()
  if (!value || typeof value !== 'object') return match
  const row = value as Record<string, unknown>
  if (typeof row.categoryId === 'string') match.categoryId = row.categoryId
  if (typeof row.subcategory === 'boolean') match.subcategory = row.subcategory
  if (typeof row.subcategoryId === 'string') match.subcategoryId = row.subcategoryId
  if (row.properties && typeof row.properties === 'object') {
    const properties: Record<string, string> = {}
    for (const [key, optionId] of Object.entries(row.properties as Record<string, unknown>)) {
      if (typeof optionId === 'string' && optionId) properties[key] = optionId
    }
    match.properties = properties
  }
  return match
}

/** Read a stored config object. Unknown shapes fall back to ready + match. */
export function parseIdentifySettings(enabled: boolean, config: unknown): IdentifyProviderSettings {
  const settings = defaultIdentifySettings(enabled)
  if (!config || typeof config !== 'object') return settings
  const row = config as Record<string, unknown>
  if (row.response === 'mock' || row.response === 'ready') settings.response = row.response
  if (typeof row.scenario === 'string' && SCENARIOS.includes(row.scenario as IdentifyMockScenario)) {
    settings.scenario = row.scenario as IdentifyMockScenario
  }
  if (typeof row.suggestionId === 'string') settings.suggestionId = row.suggestionId
  if (row.match) settings.match = matchOf(row.match)
  return settings
}

export function mergeIdentifySettings(
  current: IdentifyProviderSettings,
  patch: Partial<IdentifyProviderSettings>,
): IdentifyProviderSettings {
  const response: IdentifyResponseMode =
    patch.response === 'ready' || patch.response === 'mock' ? patch.response : current.response
  const scenario =
    patch.scenario && SCENARIOS.includes(patch.scenario) ? patch.scenario : current.scenario
  return {
    enabled: typeof patch.enabled === 'boolean' ? patch.enabled : current.enabled,
    response,
    scenario,
    suggestionId: typeof patch.suggestionId === 'string' ? patch.suggestionId : current.suggestionId,
    match: patch.match ? matchOf(patch.match) : current.match,
  }
}

/** Body for `PUT /api/identify/providers/:id`. Null when nothing valid was sent. */
export function identifySettingsPatch(body: Record<string, unknown>): Partial<IdentifyProviderSettings> | null {
  const patch: Partial<IdentifyProviderSettings> = {}
  if (typeof body.enabled === 'boolean') patch.enabled = body.enabled
  if (body.response === 'ready' || body.response === 'mock') patch.response = body.response
  if (typeof body.scenario === 'string' && SCENARIOS.includes(body.scenario as IdentifyMockScenario)) {
    patch.scenario = body.scenario as IdentifyMockScenario
  }
  if (typeof body.suggestionId === 'string') patch.suggestionId = body.suggestionId.trim().slice(0, 80)
  if (body.match && typeof body.match === 'object') patch.match = matchOf(body.match)
  return Object.keys(patch).length ? patch : null
}
