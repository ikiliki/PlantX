import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { ConsentPrompt } from './ConsentDialog'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Legal/ConsentDialog',
  component: ConsentPrompt,
  decorators: [withApp],
}

export const Ask = () => <ConsentPrompt onAgree={async () => true} onSignOut={() => undefined} />
export const SaveFails = () => <ConsentPrompt onAgree={async () => false} onSignOut={() => undefined} />
