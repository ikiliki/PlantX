import { useEffect, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import { AdminPage } from './AdminPage'

function SignedIn({ id, children }: { id: string; children: ReactNode }) {
  const { loginAs } = useStore()
  useEffect(() => {
    loginAs(id)
  }, [id, loginAs])
  return children
}

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter initialEntries={['/admin/server']}>
        <Story />
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Admin/AdminPage',
  component: AdminPage,
  decorators: [withApp],
}

export const Default = () => (
  <SignedIn id="u-dana">
    <AdminPage tab="server">
      <p>Admin content</p>
    </AdminPage>
  </SignedIn>
)

export const GuestBlocked = () => (
  <AdminPage tab="server">
    <p>Hidden</p>
  </AdminPage>
)
