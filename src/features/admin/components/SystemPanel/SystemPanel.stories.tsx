import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../../auth/AuthProvider'
import { SellProvider } from '../../../sell/SellProvider'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { SystemPanel } from './SystemPanel'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <AuthProvider>
          <SellProvider>
            <Story />
          </SellProvider>
        </AuthProvider>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Admin/SystemPanel',
  component: SystemPanel,
  decorators: [withApp],
}

export const Default = () => <SystemPanel />
