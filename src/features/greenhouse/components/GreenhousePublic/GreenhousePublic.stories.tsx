import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { GreenhousePublic } from './GreenhousePublic'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ maxWidth: 640, minHeight: 360 }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/GreenhousePublic',
  component: GreenhousePublic,
  decorators: [withApp],
}

export const Grower = () => <GreenhousePublic ownerId="u-maya" />

export const Nursery = () => <GreenhousePublic ownerId="u-gal" />

export const Compact = () => <GreenhousePublic ownerId="u-gal" compact />
