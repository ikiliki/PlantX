import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../i18n/I18nProvider'
import { StoreProvider } from '../../mock/store'
import { LegalPage } from './LegalPage'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Pages/LegalPage',
  component: LegalPage,
  decorators: [withApp],
}

export const Privacy = () => <LegalPage doc="privacy" />
export const Terms = () => <LegalPage doc="terms" />
