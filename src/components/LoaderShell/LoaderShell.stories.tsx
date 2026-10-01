import type { ReactNode } from 'react'
import { I18nProvider } from '../../i18n/I18nProvider'
import { StoreProvider } from '../../mock/store'
import { LoaderShell } from './LoaderShell'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <Story />
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Components/LoaderShell',
  component: LoaderShell,
  decorators: [withApp],
}

export const Waiting = () => <LoaderShell busy />

export const CompactWidget = () => <LoaderShell busy compact />

export const Ready = () => (
  <LoaderShell busy={false}>
    <p>Tables</p>
  </LoaderShell>
)
