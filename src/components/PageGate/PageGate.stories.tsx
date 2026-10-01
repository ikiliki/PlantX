import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../i18n/I18nProvider'
import { StoreProvider } from '../../mock/store'
import { PageGate } from './PageGate'

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
  title: 'Components/PageGate',
  component: PageGate,
  decorators: [withApp],
}

/** Default system keeps market under maintenance — no feature peek. */
export const Maintenance = () => (
  <PageGate pageId="market">
    <div>Hidden market peak</div>
  </PageGate>
)

export const Live = () => (
  <PageGate pageId="home">
    <div style={{ padding: 24 }}>Home content when the page is live.</div>
  </PageGate>
)
