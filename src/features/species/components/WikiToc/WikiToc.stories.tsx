import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { WikiToc } from './WikiToc'

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
  title: 'Features/Species/WikiToc',
  component: WikiToc,
  decorators: [withApp],
}

export const Sections = () => (
  <WikiToc
    items={[
      { id: 'overview', title: 'Overview' },
      { id: 'seasonal', title: 'Seasonal care' },
      { id: 'grades', title: 'What the grades mean' },
    ]}
  />
)

export const Nested = () => (
  <WikiToc
    items={[
      {
        id: 'common',
        title: 'Common',
        href: '/wiki#common',
        children: [
          { id: 'sp-pothos', title: 'Pothos', href: '/wiki/sp-pothos' },
          { id: 'sp-pothos', title: 'Pothos', href: '/wiki/sp-pothos' },
        ],
      },
      {
        id: 'rare',
        title: 'Rare',
        href: '/wiki#rare',
        children: [{ id: 'sp-monstera', title: 'Monstera Deliciosa', href: '/wiki/sp-monstera' }],
      },
    ]}
  />
)
