import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import { PassportMarket } from './PassportMarket'

function StoryBody({ masked = false }: { masked?: boolean }) {
  const { db } = useStore()
  const plant =
    db.plants.find((item) => item.marketClassId && item.status === 'listed') ??
    db.plants.find((item) => item.status === 'listed') ??
    db.plants[0]
  if (!plant) return null
  const listing = db.listings.find((item) => item.plantId === plant.id && item.status === 'active')
  return <PassportMarket plant={plant} selectedListingId={listing?.id} masked={masked} />
}

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ padding: 24, maxWidth: 720, background: '#F4F1E8' }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/PassportMarket',
  component: PassportMarket,
  decorators: [withApp],
}

export const Default = () => <StoryBody />

export const Masked = () => <StoryBody masked />
