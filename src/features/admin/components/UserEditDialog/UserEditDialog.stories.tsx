import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import { UserEditDialog } from './UserEditDialog'

function FirstMember() {
  const { db } = useStore()
  const user = db.users.find((item) => item.role === 'grower')
  return user ? <UserEditDialog user={user} onClose={() => undefined} /> : null
}

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <Story />
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Admin/UserEditDialog',
  component: UserEditDialog,
  decorators: [withApp],
}

export const Default = () => <FirstMember />
