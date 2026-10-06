import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import type { WebhookStatus } from '../../../../mock/types'
import { WebhooksView } from './WebhooksPanel'

const withI18n = (Story: () => ReactNode) => (
  <I18nProvider>
    <Story />
  </I18nProvider>
)

export default {
  title: 'Features/Admin/WebhooksPanel',
  component: WebhooksView,
  decorators: [withI18n],
}

const webhooks: WebhookStatus[] = [
  { id: 'alerts', env: 'PLANTX_ALERT_WEBHOOK_URL', configured: true, enabled: true },
  { id: 'signups', env: 'PLANTX_EVENTS_WEBHOOK_URL', configured: true, enabled: true },
  { id: 'signins', env: 'PLANTX_EVENTS_WEBHOOK_URL', configured: true, enabled: false },
  { id: 'activities', env: 'PLANTX_EVENTS_WEBHOOK_URL', configured: false, enabled: true },
]

export const Mixed = () => (
  <WebhooksView
    webhooks={webhooks}
    busy={null}
    notes={{ alerts: { text: 'Test sent. Check the channel.' } }}
    onToggle={() => undefined}
    onTest={() => undefined}
  />
)
