import { AdminPage } from '../../features/admin/components/AdminPage/AdminPage'
import { ServerPanel } from '../../features/admin/components/ServerPanel/ServerPanel'

export function ServerPage() {
  return (
    <AdminPage tab="server">
      <ServerPanel />
    </AdminPage>
  )
}
