import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import type { Plant } from '../../../../mock/types'
import { PlantOwnerControls } from './PlantOwnerControls'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ padding: 24, maxWidth: 420 }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/PlantOwnerControls',
  component: PlantOwnerControls,
  decorators: [withApp],
}

const plant = { id: 'p1', title: 'Golden pothos', titleHe: 'פותוס זהוב', ownerId: 'u' } as Plant

export const Public = () => <PlantOwnerControls plant={plant} />
export const Private = () => <PlantOwnerControls plant={{ ...plant, private: true }} />
