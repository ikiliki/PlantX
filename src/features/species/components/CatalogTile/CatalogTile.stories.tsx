import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import { catalogSpeciesList } from '../../catalogSpecies'
import { CatalogTile } from './CatalogTile'

function First() {
  const { db } = useStore()
  const species = catalogSpeciesList(db)[0]
  return species ? <CatalogTile species={species} onOpen={() => undefined} /> : null
}

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ width: 200, padding: 16 }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Species/CatalogTile',
  component: CatalogTile,
}

export const Tile = () => <First />
Tile.decorators = [withApp]
