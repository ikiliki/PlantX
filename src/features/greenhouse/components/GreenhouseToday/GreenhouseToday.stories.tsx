import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import { GreenhouseToday } from './GreenhouseToday'

function StoryBody() {
  const { db, currentUser, confirmWater, refreshPhoto } = useStore()
  const ownerId = currentUser?.id ?? db.visitorId
  const plants = db.plants.filter((plant) => plant.ownerId === ownerId && plant.status !== 'sold')
  return <GreenhouseToday plants={plants} onWater={confirmWater} onRefresh={refreshPhoto} />
}

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ padding: 24, maxWidth: 560, background: '#F4F1E8' }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/GreenhouseToday',
  component: GreenhouseToday,
  decorators: [withApp],
}

export const Default = () => <StoryBody />
