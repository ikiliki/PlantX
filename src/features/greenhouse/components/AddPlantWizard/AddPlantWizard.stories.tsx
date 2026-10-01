import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { AddPlantWizard } from './AddPlantWizard'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ padding: 24, maxWidth: 720, background: '#F4F1E8' }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/AddPlantWizard',
  component: AddPlantWizard,
  decorators: [withApp],
}

export const Default = () => <AddPlantWizard />

export const Narrow = () => (
  <div style={{ width: 340 }}>
    <AddPlantWizard />
  </div>
)
