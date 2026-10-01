import { AdminPage } from '../../features/admin/components/AdminPage/AdminPage'
import { ServerPanel } from '../../features/admin/components/ServerPanel/ServerPanel'
import { useI18n } from '../../i18n/I18nProvider'

export function ServerPage() {
  const { t } = useI18n()
  return (
    <AdminPage tab="server" title={t.admin.server} lead={t.admin.serverLead}>
      <ServerPanel />
    </AdminPage>
  )
}
