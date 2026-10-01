import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../i18n/I18nProvider'
import { HoldNotice } from './HoldNotice'

const withApp = (Story: () => ReactNode) => (
  <I18nProvider>
    <MemoryRouter>
      <Story />
    </MemoryRouter>
  </I18nProvider>
)

export default {
  title: 'Components/HoldNotice',
  component: HoldNotice,
  decorators: [withApp],
}

export const NotLaunched = () => <HoldNotice mode="not-launched" />

export const Maintenance = () => <HoldNotice mode="maintenance" />

export const Preview = () => (
  <div style={{ height: 640 }}>
    <HoldNotice mode="not-launched" preview />
  </div>
)
