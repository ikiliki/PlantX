import type { ReactNode } from 'react'
import { useState } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { AddPlantDialog } from './AddPlantDialog'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <Story />
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/AddPlantDialog',
  component: AddPlantDialog,
  decorators: [withApp],
}

export const Open = () => {
  const [open, setOpen] = useState(true)
  return open ? (
    <AddPlantDialog onClose={() => setOpen(false)} />
  ) : (
    <button type="button" onClick={() => setOpen(true)}>
      Add plant
    </button>
  )
}
