import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../i18n/I18nProvider'
import { HoldStage } from './HoldStage'

const withApp = (Story: () => ReactNode) => (
  <I18nProvider>
    <MemoryRouter>
      <Story />
    </MemoryRouter>
  </I18nProvider>
)

export default {
  title: 'Components/HoldStage',
  component: HoldStage,
  decorators: [withApp],
}

export const Page = () => (
  <HoldStage mode="preview" mark="Preview" title="This page isn’t open yet" body="Nothing here is available right now." />
)
