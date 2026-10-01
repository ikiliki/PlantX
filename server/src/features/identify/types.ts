import type {
  Catalog,
  IdentifyProviderId,
  IdentifyProviderStatus,
} from '../../../../src/mock/types.ts'

/** Provider answer before catalog mapping. */
export type RawSuggestion = {
  provider: IdentifyProviderId
  label: string
  scientificName: string
  commonNames: string[]
  genus?: string
  cultivar?: string
  probability: number
  isPlant: boolean
  /** Gemini may return catalog ids directly. */
  categoryId?: string
  subcategoryId?: string
  quality?: string
  size?: string
  stage?: string
  traits?: Record<string, string>
}

/** What a provider reports about itself. The admin `enabled` flag is added by the service. */
export type ProviderHealth = Omit<IdentifyProviderStatus, 'enabled'>

export type IdentifyProvider = {
  id: IdentifyProviderId
  order: number
  status: () => Promise<ProviderHealth>
  identify: (image: string, catalog: Catalog) => Promise<RawSuggestion>
}

export const IDENTIFY_TIMEOUT_MS = 12_000
