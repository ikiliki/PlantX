import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import type { IssueReport } from '../../../../lib/issueReport'
import { StoreProvider } from '../../../../mock/store'
import { IssueReports } from './IssueReports'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <Story />
    </I18nProvider>
  </StoreProvider>
)

const sample: IssueReport = {
  id: 'issue-story',
  createdAt: '2026-10-02T09:15:00.000Z',
  userId: 'u-maya',
  userName: 'Maya',
  note: 'I added a photo and the garden stopped.',
  status: 'open',
  context: {
    kind: 'http',
    status: 500,
    method: 'POST',
    path: '/api/plants',
    page: 'http://127.0.0.1:5174/greenhouse',
    referrer: 'http://127.0.0.1:5174/',
    message: 'Internal error',
    stack: 'Error: HTTP 500 POST /api/plants\n    at plantFetch (httpNotice.ts:90)\n    at postPlant',
    response: '{"error":"internal","message":"Internal error"}',
    userAgent: 'Mozilla/5.0',
    language: 'en',
    viewport: '1280x800@1',
    screen: '1440x900',
    timezone: 'Asia/Jerusalem',
    network: '4g',
    online: true,
    at: '2026-10-02T09:15:00.000Z',
    requestId: '',
  },
}

export default {
  title: 'Features/Admin/IssueReports',
  component: IssueReports,
  decorators: [withApp],
}

export const Open = () => <IssueReports seed={[sample]} initialOpen />

export const Empty = () => <IssueReports seed={[]} initialOpen />
