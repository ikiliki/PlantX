import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { CatalogPreview } from './CatalogPreview'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Species/CatalogPreview',
  component: CatalogPreview,
  decorators: [withApp],
}

export const Pothos = () => <CatalogPreview speciesId="sp-pothos" onClose={() => {}} />
export const Snake = () => <CatalogPreview speciesId="sp-snake" onClose={() => {}} />
