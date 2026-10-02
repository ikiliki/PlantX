import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import type { PlantIdentification } from '../../../../mock/types'
import { IdentifyBadge } from './IdentifyBadge'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ display: 'grid', gap: 12, padding: 24, justifyItems: 'start' }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/IdentifyBadge',
  component: IdentifyBadge,
  decorators: [withApp],
}

const at = '2026-10-01T12:00:00.000Z'

export const aiIdentification: PlantIdentification = {
  source: 'ai',
  provider: 'gemini',
  mode: 'live',
  label: 'Monstera deliciosa',
  scientificName: 'Monstera deliciosa',
  probability: 0.93,
  at,
}

export const editedIdentification: PlantIdentification = {
  source: 'edited',
  provider: 'gemini',
  mode: 'live',
  label: 'Philodendron hederaceum',
  probability: 0.71,
  at,
}

export const manualIdentification: PlantIdentification = { source: 'manual', at }

export const AiVerified = () => <IdentifyBadge identification={aiIdentification} />
export const AiDemo = () => <IdentifyBadge identification={{ ...aiIdentification, mode: 'mock', provider: 'plantnet' }} />
export const Edited = () => <IdentifyBadge identification={editedIdentification} />
export const Manual = () => <IdentifyBadge identification={manualIdentification} />
export const NoRecord = () => <IdentifyBadge />

export const Compact = () => (
  <>
    <IdentifyBadge identification={aiIdentification} compact />
    <IdentifyBadge identification={editedIdentification} compact />
    <IdentifyBadge identification={manualIdentification} compact />
    <IdentifyBadge compact />
  </>
)
