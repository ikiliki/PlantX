import { AdminPage } from '../../features/admin/components/AdminPage/AdminPage'
import { ReactionTable } from '../../features/admin/components/ReactionTable/ReactionTable'
import { ServerPanel } from '../../features/admin/components/ServerPanel/ServerPanel'

export function ServerPage() {
  return (
    <AdminPage tab="server">
      <ServerPanel />
      <ReactionTable />
    </AdminPage>
  )
}
