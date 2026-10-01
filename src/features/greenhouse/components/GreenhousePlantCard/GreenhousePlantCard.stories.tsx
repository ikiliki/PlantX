import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { plantImages } from '../../../../mock/images'
import { StoreProvider, useStore } from '../../../../mock/store'
import type { PlantIdentification } from '../../../../mock/types'
import { GreenhousePlantCard } from './GreenhousePlantCard'

function CardStory({
  identification,
  fresh,
  photos,
}: {
  identification?: PlantIdentification
  fresh?: boolean
  photos?: string[]
}) {
  const { db, currentUser } = useStore()
  const ownerId = currentUser?.id ?? db.visitorId
  const found = db.plants.find((item) => item.ownerId === ownerId) ?? db.plants[0]
  if (!found) return null
  const plant = { ...found, identification: identification ?? found.identification, photos: photos ?? found.photos }
  return <GreenhousePlantCard fresh={fresh} plant={plant} />
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

const at = '2026-10-01T12:00:00.000Z'

export const NeedsAiCheck = () => <CardStory />

export const AiVerified = () => (
  <CardStory identification={{ source: 'ai', provider: 'plantid', mode: 'live', probability: 0.94, at }} />
)

export const Manual = () => <CardStory identification={{ source: 'manual', at }} />

export const ThreePhotos = () => (
  <CardStory
    photos={[plantImages.pothos, plantImages.pothosL, plantImages.pothosCutting]}
    identification={{ source: 'ai', provider: 'plantnet', mode: 'live', probability: 0.87, at }}
  />
)

export const JustAdded = () => (
  <CardStory fresh identification={{ source: 'ai', provider: 'gemini', mode: 'live', probability: 0.82, at }} />
)
