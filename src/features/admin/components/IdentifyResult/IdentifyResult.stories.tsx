import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import {
  liveFallbackRecord,
  liveUnavailableRecord,
  mockErrorRecord,
  mockMatchRecord,
  liveNotInCatalogRecord,
  mockNotInCatalogRecord,
  mockNotPlantRecord,
} from '../../identifyFixtures'
import { IdentifyResult } from './IdentifyResult'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Admin/IdentifyResult',
  component: IdentifyResult,
  decorators: [withApp],
}

export const MockMatch = () => <IdentifyResult record={mockMatchRecord} />

export const LiveFallback = () => <IdentifyResult record={liveFallbackRecord} />

export const NotInCatalog = () => <IdentifyResult record={mockNotInCatalogRecord} />

export const LiveNotInCatalog = () => <IdentifyResult record={liveNotInCatalogRecord} />

export const NotAPlant = () => <IdentifyResult record={mockNotPlantRecord} />

export const LiveUnavailable = () => <IdentifyResult record={liveUnavailableRecord} />

export const MockError = () => <IdentifyResult record={mockErrorRecord} />

export const Offline = () => (
  <IdentifyResult record={{ ...liveUnavailableRecord, tried: [] }} error="offline" />
)
