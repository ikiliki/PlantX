import { useState, type ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import type { IdentifyProviderId, IdentifyProviderStatus } from '../../../../mock/types'
import { ApisPanel } from './ApisPanel'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <Story />
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Admin/ApisPanel',
  component: ApisPanel,
  decorators: [withApp],
}

const readyProviders: IdentifyProviderStatus[] = [
  {
    id: 'plantid',
    order: 1,
    name: 'Plant.id',
    returns: 'is_plant, catalog match',
    docsUrl: 'https://web.plant.id/plant-identification-api/',
    keySet: true,
    enabled: true,
    status: 'ready',
    credits: { remaining: 420, used: 80 },
    lastUsedAt: '2026-09-28T14:22:00.000Z',
  },
  {
    id: 'plantnet',
    order: 2,
    name: 'Pl@ntNet',
    returns: 'species suggestions',
    docsUrl: 'https://my.plantnet.org/doc/api/identify',
    keySet: true,
    enabled: true,
    status: 'ready',
    credits: { remaining: 350, total: 500, period: 'day' },
    lastUsedAt: '2026-09-27T09:10:00.000Z',
  },
  {
    id: 'gemini',
    order: 3,
    name: 'Gemini',
    returns: 'catalog draft + traits',
    docsUrl: 'https://ai.google.dev/gemini-api/docs',
    keySet: true,
    enabled: true,
    status: 'ready',
    model: 'gemini-3.8-flash',
    lastUsedAt: '2026-09-26T18:40:00.000Z',
  },
]

const oneExhausted: IdentifyProviderStatus[] = [
  {
    ...readyProviders[0],
    status: 'exhausted',
    credits: { remaining: 0, used: 500 },
  },
  readyProviders[1],
  readyProviders[2],
]

const oneDisabled: IdentifyProviderStatus[] = [
  readyProviders[0],
  { ...readyProviders[1], enabled: false },
  readyProviders[2],
]

const keysMissing: IdentifyProviderStatus[] = readyProviders.map((provider) => ({
  ...provider,
  keySet: false,
  status: 'missingKey' as const,
  credits: undefined,
  lastUsedAt: undefined,
  lastError: provider.id === 'gemini' ? 'GEMINI_API_KEY not set' : undefined,
}))

export const AllReady = () => {
  const [providers, setProviders] = useState(readyProviders)
  return (
    <ApisPanel
      providers={providers}
      onRefresh={() => undefined}
      onEnabledChange={(id, enabled) =>
        setProviders((rows) => rows.map((row) => (row.id === id ? { ...row, enabled } : row)))
      }
    />
  )
}

export const OneDisabled = () => (
  <ApisPanel providers={oneDisabled} onRefresh={() => undefined} onEnabledChange={() => undefined} />
)

export const Saving = () => (
  <ApisPanel
    providers={oneDisabled}
    onEnabledChange={() => undefined}
    saving={new Set<IdentifyProviderId>(['plantnet'])}
  />
)

export const OneExhausted = () => (
  <ApisPanel providers={oneExhausted} onRefresh={() => undefined} onEnabledChange={() => undefined} />
)

export const KeysMissing = () => <ApisPanel providers={keysMissing} onRefresh={() => undefined} />

export const Empty = () => <ApisPanel providers={[]} onRefresh={() => undefined} />

export const Loading = () => <ApisPanel providers={[]} loading onRefresh={() => undefined} />
