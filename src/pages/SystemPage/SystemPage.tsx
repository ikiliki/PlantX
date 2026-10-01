import { PageHeader } from '../../app/AppShell/AppShell.styles'
import { Card } from '../../components/Card/Card'
import { AdminTabs } from '../../features/admin/components/AdminTabs/AdminTabs'
import { SystemPanel } from '../../features/admin/components/SystemPanel/SystemPanel'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { Page } from './SystemPage.styles'

export function SystemPage() {
  const { currentUser } = useStore()
  const { t } = useI18n()

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <Page>
        <PageHeader>
          <h1>{t.admin.system}</h1>
        </PageHeader>
        <Card>
          <p>{t.common.guestBlocked}</p>
        </Card>
      </Page>
    )
  }

  return (
    <Page>
      <PageHeader>
        <div>
          <h1>{t.admin.system}</h1>
          <p>{t.admin.systemLead}</p>
        </div>
      </PageHeader>
      <AdminTabs current="system" />
      <SystemPanel />
    </Page>
  )
}
