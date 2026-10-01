import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../i18n/I18nProvider'
import { StoreProvider } from '../../../mock/store'
import { NavMenu } from './NavMenu'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ padding: 48 }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'App/NavMenu',
  component: NavMenu,
  decorators: [withApp],
}

export const Grouped = () => (
  <NavMenu
    label="Wiki"
    to="/wiki"
    open
    onOpen={() => undefined}
    onClose={() => undefined}
    items={[
      { to: '/wiki', label: 'All' },
      {
        to: '/wiki#common',
        label: 'Common',
        dividerBefore: true,
        children: [
          { to: '/wiki/sp-pothos', label: 'Pothos' },
          { to: '/wiki/sp-pothos', label: 'Pothos' },
        ],
      },
      {
        to: '/wiki#rare',
        label: 'Rare',
        children: [{ to: '/wiki/sp-monstera', label: 'Monstera Deliciosa' }],
      },
    ]}
  />
)
