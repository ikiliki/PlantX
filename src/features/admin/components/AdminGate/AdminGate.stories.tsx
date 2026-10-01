import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { AdminGate } from './AdminGate'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter initialEntries={['/admin']}>
        <Story />
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Admin/AdminGate',
  component: AdminGate,
  decorators: [withApp],
}

/** Signed-out visitors get Google sign-in only. */
export const SignedOut = () => (
  <Routes>
    <Route element={<AdminGate />}>
      <Route path="/admin" element={<p>Admin tools</p>} />
    </Route>
  </Routes>
)
