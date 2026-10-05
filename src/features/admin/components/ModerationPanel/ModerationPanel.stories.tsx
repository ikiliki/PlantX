import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { ModerationPanel } from './ModerationPanel'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ padding: 24 }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Admin/ModerationPanel',
  component: ModerationPanel,
  decorators: [withApp],
}

/** Example data stands in for the API: rows, filters and actions; no log. */
export const Default = () => <ModerationPanel />
