import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import { ScanQuotaDialog } from './ScanQuotaDialog'

function FirstMember() {
  const { db } = useStore()
  const user = db.users.find((item) => item.role === 'grower')
  return user ? <ScanQuotaDialog user={user} onClose={() => undefined} /> : null
}

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <Story />
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Admin/ScanQuotaDialog',
  component: ScanQuotaDialog,
  decorators: [withApp],
}

/** Storybook has no API, so it shows the needs-API note and the controls disabled. */
export const NoApi = () => <FirstMember />
