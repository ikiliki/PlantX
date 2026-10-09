import type { ReactNode } from 'react'
import { I18nProvider } from '../../i18n/I18nProvider'
import { StoreProvider } from '../../mock/store'
import { PreprodBar } from './PreprodBar'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ minHeight: 420 }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'App/PreprodBar',
  component: PreprodBar,
  decorators: [withApp],
}

/** Renders only when the server says this is PP. Empty elsewhere. */
export const OnlyOnPreprod = () => <PreprodBar />
