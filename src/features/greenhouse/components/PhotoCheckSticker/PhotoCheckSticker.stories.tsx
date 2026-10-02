import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { PhotoCheckSticker } from './PhotoCheckSticker'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: 24, alignItems: 'center' }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/PhotoCheckSticker',
  component: PhotoCheckSticker,
  decorators: [withApp],
}

export const AllResults = () => (
  <>
    <PhotoCheckSticker
      check={{ position: 0, result: 'match', provider: 'gemini', mode: 'live', label: 'Golden pothos', probability: 0.93 }}
    />
    <PhotoCheckSticker
      check={{ position: 1, result: 'mismatch', provider: 'plantnet', label: 'Monstera deliciosa', probability: 0.71 }}
    />
    <PhotoCheckSticker check={{ position: 2, result: 'notPlant', provider: 'gemini' }} />
    <PhotoCheckSticker check={{ position: 0, result: 'failed' }} />
    <PhotoCheckSticker check={{ position: 1, result: 'unscanned' }} />
    <PhotoCheckSticker scanning />
  </>
)

export const Medium = () => (
  <PhotoCheckSticker size="md" check={{ position: 0, result: 'match', provider: 'gemini', mode: 'mock', probability: 0.88 }} />
)
