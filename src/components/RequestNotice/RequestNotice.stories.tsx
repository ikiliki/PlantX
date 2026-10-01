import type { ReactNode } from 'react'
import { I18nProvider } from '../../i18n/I18nProvider'
import type { HttpNotice } from '../../lib/httpNotice'
import { RequestNoticeStack } from './RequestNotice'

const withApp = (Story: () => ReactNode) => (
  <I18nProvider>
    <Story />
  </I18nProvider>
)

const items: HttpNotice[] = [
  { id: 1, method: 'PUT', path: '/api/system', status: 200, tone: 'ok' },
  { id: 2, method: 'GET', path: '/api/live', status: 500, tone: 'fail' },
]

export default {
  title: 'Components/RequestNotice',
  component: RequestNoticeStack,
  decorators: [withApp],
}

export const Side = () => <RequestNoticeStack items={items} onDismiss={() => undefined} />
