import { useEffect, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import { ShelfBoard } from './ShelfBoard'

function MayaShelves() {
  const { db, loginAs } = useStore()
  useEffect(() => {
    loginAs('u-maya')
  }, [loginAs])
  return <ShelfBoard plants={db.plants.filter((plant) => plant.ownerId === 'u-maya')} />
}

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ containerType: 'inline-size', width: 900, maxWidth: '100%', padding: 16 }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/ShelfBoard',
  component: ShelfBoard,
}

export const Empty = () => <MayaShelves />
Empty.decorators = [withApp]
