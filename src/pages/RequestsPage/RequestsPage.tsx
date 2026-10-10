import { AdminPage } from '../../features/admin/components/AdminPage/AdminPage'
import { IssueReports } from '../../features/admin/components/IssueReports/IssueReports'
import { RequestsPanel } from '../../features/admin/components/RequestsPanel/RequestsPanel'

export function RequestsPage() {
  return (
    <AdminPage tab="requests">
      <IssueReports />
      <RequestsPanel />
    </AdminPage>
  )
}
