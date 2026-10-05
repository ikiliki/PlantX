import { AdminPage } from '../../features/admin/components/AdminPage/AdminPage'
import { ModerationPanel } from '../../features/admin/components/ModerationPanel/ModerationPanel'

export function ModerationPage() {
  return (
    <AdminPage tab="moderation">
      <ModerationPanel />
    </AdminPage>
  )
}
