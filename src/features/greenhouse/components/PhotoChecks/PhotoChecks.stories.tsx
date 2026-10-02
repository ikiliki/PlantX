import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { plantImages } from '../../../../mock/images'
import { StoreProvider } from '../../../../mock/store'
import { PhotoChecks } from './PhotoChecks'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ padding: 24, maxWidth: 520 }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/PhotoChecks',
  component: PhotoChecks,
  decorators: [withApp],
}

const photos = [plantImages.pothos, plantImages.monstera, plantImages.cuttings]

export const ThreePhotos = () => (
  <PhotoChecks
    photos={photos}
    checks={[
      { position: 0, result: 'match', provider: 'gemini', mode: 'live', label: 'Golden pothos', probability: 0.93 },
      { position: 1, result: 'mismatch', provider: 'plantnet', label: 'Monstera deliciosa', probability: 0.62 },
      { position: 2, result: 'unscanned' },
    ]}
  />
)

export const Small = () => (
  <PhotoChecks
    size="sm"
    photos={photos.slice(0, 2)}
    checks={[
      { position: 0, result: 'match', provider: 'gemini', mode: 'mock', probability: 0.88 },
      { position: 1, result: 'notPlant', provider: 'gemini' },
    ]}
  />
)
