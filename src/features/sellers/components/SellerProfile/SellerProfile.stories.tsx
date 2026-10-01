import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { SellerProfile } from './SellerProfile'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ height: 660, maxWidth: 1000 }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Sellers/SellerProfile',
  component: SellerProfile,
  decorators: [withApp],
}

export const HomeGrower = () => <SellerProfile userId="u-maya" />

export const Nursery = () => <SellerProfile userId="u-gal" />

export const NotFound = () => <SellerProfile userId="u-missing" />
