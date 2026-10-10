import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { InAppBrowserNotice } from './InAppBrowserNotice'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ background: '#1F5135', padding: 24, maxWidth: 380 }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Auth/InAppBrowserNotice',
  component: InAppBrowserNotice,
  decorators: [withApp],
}

/** Inside the Google app on an iPhone. */
export const GoogleApp = () => <InAppBrowserNotice app="Google" url="https://www.plantxhub.com/login" />
