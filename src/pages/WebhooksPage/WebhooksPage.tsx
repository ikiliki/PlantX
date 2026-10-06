import { AdminPage } from '../../features/admin/components/AdminPage/AdminPage'
import { WebhooksPanel } from '../../features/admin/components/WebhooksPanel/WebhooksPanel'

export function WebhooksPage() {
  return (
    <AdminPage tab="webhooks">
      <WebhooksPanel />
    </AdminPage>
  )
}
