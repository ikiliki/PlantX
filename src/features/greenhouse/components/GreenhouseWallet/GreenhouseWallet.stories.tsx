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

export const Desktop = () => (
  <div style={{ maxWidth: 1100, width: '100%', containerType: 'inline-size', display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'center' }}>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5D7C4E' }}>Living collection</div>
      <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 40, color: '#173128' }}>Greenhouse</div>
    </div>
    <GreenhouseWallet
      title="Wallet"
      value="₪7,468"
      valueLabel="Estimated market value"
      collection="6"
      collectionLabel="Plants in greenhouse"
    />
  </div>
)

export const Phone = () => (
  <div style={{ maxWidth: 360, width: '100%', containerType: 'inline-size' }}>
    <GreenhouseWallet
      title="Wallet"
      value="₪838"
      valueLabel="Estimated market value"
      collection="6"
      collectionLabel="Plants in greenhouse"
    />
  </div>
)
