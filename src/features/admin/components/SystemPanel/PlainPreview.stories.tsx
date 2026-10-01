import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../../auth/AuthProvider'
import { SellProvider } from '../../../sell/SellProvider'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { PlainPreview } from './PlainPreview'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <AuthProvider>
          <SellProvider>
            <div style={{ maxWidth: 720 }}>
              <Story />
            </div>
          </SellProvider>
        </AuthProvider>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Admin/PlainPreview',
  component: PlainPreview,
  decorators: [withApp],
}
