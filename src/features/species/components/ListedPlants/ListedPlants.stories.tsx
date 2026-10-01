import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { ListedPlants } from './ListedPlants'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ maxWidth: 1100 }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Species/ListedPlants',
  component: ListedPlants,
  decorators: [withApp],
}

export const Pothos = () => <ListedPlants speciesId="sp-pothos" marketHref="/market/categories/sp-pothos" />

export const Empty = () => <ListedPlants speciesId="sp-missing" />
