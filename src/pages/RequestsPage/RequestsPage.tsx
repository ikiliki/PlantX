import { AdminPage } from '../../features/admin/components/AdminPage/AdminPage'
import { RequestsPanel } from '../../features/admin/components/RequestsPanel/RequestsPanel'
import { useI18n } from '../../i18n/I18nProvider'

export function RequestsPage() {
  const { t } = useI18n()
  return (
    <AdminPage tab="requests" title={t.admin.requests} lead={t.admin.requestsLead}>
      <RequestsPanel />
    </AdminPage>
  )
}
