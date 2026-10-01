import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../i18n/I18nProvider'
import { NotLaunched } from './NotLaunched'

const withApp = (Story: () => ReactNode) => (
  <I18nProvider>
    <MemoryRouter>
      <Story />
    </MemoryRouter>
  </I18nProvider>
)

export default {
  title: 'Components/NotLaunched',
  component: NotLaunched,
  decorators: [withApp],
}

export const Page = () => <NotLaunched />
