import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import type { Shelf } from '../../../../mock/types'
import { ShelfRow } from './ShelfRow'

const shelves: Shelf[] = [
  { id: 's1', ownerId: 'u-maya', name: 'Balcony', position: 0 },
  { id: 's2', ownerId: 'u-maya', name: 'Living room', position: 1 },
]

function Balcony() {
  const { db } = useStore()
  return (
    <ShelfRow
      shelf={shelves[0]}
      plants={db.plants.slice(0, 3)}
      shelves={shelves}
      first
      onRename={async () => true}
      onPlace={() => undefined}
    />
  )
}

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ containerType: 'inline-size', width: 720, maxWidth: '100%', padding: 16 }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/ShelfRow',
  component: ShelfRow,
}

export const WithPlants = () => <Balcony />
WithPlants.decorators = [withApp]
