import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { DeleteAccountDialog } from './DeleteAccountDialog'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <Story />
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Profile/DeleteAccountDialog',
  component: DeleteAccountDialog,
  decorators: [withApp],
}

export const WithPlants = () => <DeleteAccountDialog plants={4} onDelete={async () => true} onClose={() => undefined} />
export const DeleteFails = () => <DeleteAccountDialog plants={0} onDelete={async () => false} onClose={() => undefined} />
