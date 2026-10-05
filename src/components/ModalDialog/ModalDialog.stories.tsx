import type { ReactNode } from 'react'
import { I18nProvider } from '../../i18n/I18nProvider'
import { StoreProvider } from '../../mock/store'
import { Button } from '../Button/Button'
import { Field, Input } from '../Form/Form'
import { ModalDialog } from './ModalDialog'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <Story />
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Components/ModalDialog',
  component: ModalDialog,
  decorators: [withApp],
}

export const WithForm = () => (
  <ModalDialog
    title="Edit plant"
    lead="Changes show on the passport right away."
    onClose={() => undefined}
    footer={
      <>
        <Button variant="ghost" type="button">
          Cancel
        </Button>
        <Button variant="growth" type="button">
          Save
        </Button>
      </>
    }
  >
    <Field>
      Name
      <Input defaultValue="Golden pothos" />
    </Field>
  </ModalDialog>
)

export const Confirm = () => (
  <ModalDialog
    title="Hide Noa Levi?"
    lead="This also hides 12 plants, 48 activities and 9 tasks."
    onClose={() => undefined}
    footer={
      <>
        <Button variant="ghost" type="button">
          Cancel
        </Button>
        <Button variant="danger" type="button">
          Hide
        </Button>
      </>
    }
  />
)
