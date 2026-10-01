import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import { GreenhousePlantCard, AddPlantCard } from './GreenhousePlantCard'

function CardStory() {
  const { db, currentUser, refreshPhoto, confirmWater } = useStore()
  const ownerId = currentUser?.id ?? db.visitorId
  const plant = db.plants.find((item) => item.ownerId === ownerId) ?? db.plants[0]
  if (!plant) return null
  return (
    <GreenhousePlantCard
      plant={plant}
      onUpdate={() => refreshPhoto(plant.id)}
      onWater={() => confirmWater(plant.id)}
      onPropagate={() => undefined}
      onSell={() => undefined}
    />
  )
}

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ padding: 24, maxWidth: 280, background: '#F4F1E8' }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/GreenhousePlantCard',
  component: GreenhousePlantCard,
  decorators: [withApp],
}

export const Default = () => <CardStory />

export const Add = () => <AddPlantCard onClick={() => undefined} />
