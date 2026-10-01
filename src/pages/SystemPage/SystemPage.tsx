import { AdminPage } from '../../features/admin/components/AdminPage/AdminPage'
import { ApiDown } from '../../features/admin/components/ApiDown/ApiDown'
import { SystemPanel } from '../../features/admin/components/SystemPanel/SystemPanel'
import { useI18n } from '../../i18n/I18nProvider'
import { formatApiFailure } from '../../lib/apiFailure'
import { useStore } from '../../mock/store'

export function SystemPage() {
  const { t } = useI18n()
  const { liveStatus, liveFailure, plantxEnv } = useStore()
  const down = plantxEnv !== 'mock' && liveStatus === 'down'
  return (
    <AdminPage tab="system" title={t.admin.system} lead={t.admin.systemLead}>
      {down ? <ApiDown detail={formatApiFailure(liveFailure, t.admin)} /> : <SystemPanel />}
    </AdminPage>
  )
}
