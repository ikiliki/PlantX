import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { GreenhouseWallet } from './GreenhouseWallet'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ padding: 32, background: '#F4F1E8', containerType: 'inline-size' }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/GreenhouseWallet',
  component: GreenhouseWallet,
  decorators: [withApp],
}

export const Default = () => (
  <GreenhouseWallet
    title="Wallet"
    value="₪7,468"
    valueLabel="Estimated market value"
    collection="6"
    collectionLabel="Plants in greenhouse"
  />
)
