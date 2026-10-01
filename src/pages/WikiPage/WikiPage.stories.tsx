import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { I18nProvider } from '../../i18n/I18nProvider'
import { StoreProvider } from '../../mock/store'
import { WikiPage } from './WikiPage'

const withApp = (path: string) => (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/wiki" element={<Story />} />
          <Route path="/wiki/:speciesId" element={<Story />} />
        </Routes>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Pages/WikiPage',
  component: WikiPage,
}

export const All = {
  decorators: [withApp('/wiki')],
  render: () => <WikiPage />,
}

export const Pothos = {
  decorators: [withApp('/wiki/sp-pothos')],
  render: () => <WikiPage />,
}
