import { AdminPage } from '../../features/admin/components/AdminPage/AdminPage'
import { SystemPanel } from '../../features/admin/components/SystemPanel/SystemPanel'
import { useI18n } from '../../i18n/I18nProvider'

export function SystemPage() {
  const { t } = useI18n()
  return (
    <AdminPage tab="system" title={t.admin.system} lead={t.admin.systemLead}>
      <SystemPanel />
    </AdminPage>
  )
}
