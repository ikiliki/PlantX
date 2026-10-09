import { AdminPage } from '../../features/admin/components/AdminPage/AdminPage'
import { CommentModeration } from '../../features/admin/components/CommentModeration/CommentModeration'
import { ReactionTable } from '../../features/admin/components/ReactionTable/ReactionTable'
import { ServerPanel } from '../../features/admin/components/ServerPanel/ServerPanel'

export function ServerPage() {
  return (
    <AdminPage tab="server">
      <ServerPanel />
      <ReactionTable />
      <CommentModeration readOnly />
    </AdminPage>
  )
}
