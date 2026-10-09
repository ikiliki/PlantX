import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../../auth/AuthProvider'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { HomeToday } from './HomeToday'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <AuthProvider>
        <MemoryRouter>
          <div style={{ width: 390, maxWidth: '100%', padding: 16 }}>
            <Story />
          </div>
        </MemoryRouter>
      </AuthProvider>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Discover/HomeToday',
  component: HomeToday,
}

export const Phone = () => <HomeToday />
Phone.decorators = [withApp]
