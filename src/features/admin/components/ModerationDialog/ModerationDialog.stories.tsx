import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { ModerationDialog } from './ModerationDialog'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <Story />
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Admin/ModerationDialog',
  component: ModerationDialog,
  decorators: [withApp],
}

export const HideUser = () => (
  <ModerationDialog request={{ type: 'user', id: 'u-noa', label: 'Noa Levi', action: 'hide' }} onClose={() => undefined} />
)

export const DeletePlant = () => (
  <ModerationDialog
    request={{ type: 'plant', id: 'pl-1', label: 'Golden pothos', action: 'delete' }}
    onClose={() => undefined}
  />
)

export const Restore = () => (
  <ModerationDialog request={{ type: 'user', id: 'u-noa', label: 'Noa Levi', action: 'restore' }} onClose={() => undefined} />
)
