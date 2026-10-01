import { AdminPage } from '../../features/admin/components/AdminPage/AdminPage'
import { RequestsPanel } from '../../features/admin/components/RequestsPanel/RequestsPanel'

export function RequestsPage() {
  return (
    <AdminPage tab="requests">
      <RequestsPanel />
    </AdminPage>
  )
}
