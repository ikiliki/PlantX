import { AdminPage } from '../../features/admin/components/AdminPage/AdminPage'
import { CommentModeration } from '../../features/admin/components/CommentModeration/CommentModeration'
import { ModerationPanel } from '../../features/admin/components/ModerationPanel/ModerationPanel'

export function ModerationPage() {
  return (
    <AdminPage tab="moderation">
      <ModerationPanel />
      <CommentModeration />
    </AdminPage>
  )
}
