import type { ReactNode } from 'react'
import { I18nProvider } from '../../i18n/I18nProvider'
import type { HttpNotice } from '../../lib/httpNotice'
import type { IssueContext } from '../../lib/issueReport'
import { StoreProvider } from '../../mock/store'
import { RequestNoticeStack } from './RequestNotice'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ minHeight: 220 }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

const context: IssueContext = {
  kind: 'http',
  status: 500,
  method: 'POST',
  path: '/api/plants',
  page: 'http://127.0.0.1:5174/greenhouse',
  referrer: '',
  message: 'Internal error',
  stack: 'Error: HTTP 500 POST /api/plants\n    at plantFetch',
  response: '{"error":"internal"}',
  userAgent: 'Mozilla/5.0',
  language: 'en',
  viewport: '390x844@2',
  screen: '390x844',
  timezone: 'Asia/Jerusalem',
  network: '4g',
  online: true,
  at: '2026-10-02T09:00:00.000Z',
  requestId: '',
}

const items: HttpNotice[] = [{ id: 1, tone: 'fail', context }]

export default {
  title: 'Components/RequestNotice',
  component: RequestNoticeStack,
  decorators: [withApp],
}

export const Side = () => (
  <RequestNoticeStack items={items} onDismiss={() => undefined} onReport={async () => true} />
)

export const Reporting = () => (
  <RequestNoticeStack items={items} composing onDismiss={() => undefined} onReport={async () => true} />
)
