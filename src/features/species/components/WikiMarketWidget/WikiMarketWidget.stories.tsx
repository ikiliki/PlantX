import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { WikiMarketWidget } from './WikiMarketWidget'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ maxWidth: 520, padding: 24 }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Species/WikiMarketWidget',
  component: WikiMarketWidget,
  decorators: [withApp],
}

export const All = () => <WikiMarketWidget />
export const Pothos = () => <WikiMarketWidget speciesId="sp-pothos" />
export const Compact = () => <WikiMarketWidget speciesId="sp-pothos" compact />
