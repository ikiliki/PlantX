import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../../auth/AuthProvider'
import { SellProvider } from '../../../sell/SellProvider'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { PlantPassport } from './PlantPassport'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <AuthProvider>
          <SellProvider>
            <div style={{ height: 700, maxWidth: 1040 }}>
              <Story />
            </div>
          </SellProvider>
        </AuthProvider>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/PlantPassport',
  component: PlantPassport,
  decorators: [withApp],
}

export const OwnPlant = () => <PlantPassport plantId="pl-maya-mother" embedded />

export const ListedBySeller = () => <PlantPassport plantId="pl-daniel-monstera" embedded />

export const NotFound = () => <PlantPassport plantId="pl-missing" embedded />
