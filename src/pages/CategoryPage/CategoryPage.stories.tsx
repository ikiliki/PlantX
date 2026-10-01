import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { I18nProvider } from '../../i18n/I18nProvider'
import { StoreProvider } from '../../mock/store'
import { CategoryPage } from './CategoryPage'

const at = (path: string) => (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter initialEntries={[path]}>
        <div style={{ maxWidth: 1200, padding: 24 }}>
          <Routes>
            <Route path="/market/categories/:speciesId" element={<Story />} />
          </Routes>
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Pages/CategoryPage',
  component: CategoryPage,
}

export const Pothos = () => <CategoryPage />
Pothos.decorators = [at('/market/categories/sp-pothos')]

export const Monstera = () => <CategoryPage />
Monstera.decorators = [at('/market/categories/sp-monstera')]

export const NotFound = () => <CategoryPage />
NotFound.decorators = [at('/market/categories/sp-missing')]
