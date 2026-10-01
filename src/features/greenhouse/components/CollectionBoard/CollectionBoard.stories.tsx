import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider, useI18n } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import { CollectionBoard } from './CollectionBoard'

function BoardStory({ compact = false }: { compact?: boolean }) {
  const { db, currentUser } = useStore()
  const { tr } = useI18n()
  const ownerId = currentUser?.id ?? db.visitorId
  const mine = db.plants.filter((plant) => plant.ownerId === ownerId)
  const living = mine.filter((plant) => plant.status === 'owned' || plant.status === 'listed')
  const sold = mine.filter((plant) => plant.status === 'sold')
  const activity = mine
    .flatMap((plant) =>
      plant.history.map((entry) => ({
        at: entry.at,
        plant: tr(plant.title, plant.titleHe),
        plantId: plant.id,
        photo: plant.photos[0],
        label: tr(entry.label, entry.labelHe),
      })),
    )
    .sort((a, b) => (a.at > b.at ? 1 : -1))
    .slice(-12)

  return (
    <CollectionBoard
      plants={living}
      sold={sold}
      activity={activity}
      onAdd={() => undefined}
      compact={compact}
    />
  )
}

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ padding: 24, background: '#F4F1E8', containerType: 'inline-size' }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/CollectionBoard',
  component: CollectionBoard,
  decorators: [withApp],
}

export const Default = () => <BoardStory />

export const Widget = () => <BoardStory compact />

export const EmptyGreenhouse = () => (
  <CollectionBoard
    plants={[]}
    sold={[]}
    activity={[]}
    onAdd={() => undefined}
  />
)
