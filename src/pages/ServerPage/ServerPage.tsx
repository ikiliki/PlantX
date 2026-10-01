import { PageHeader } from '../../app/AppShell/AppShell.styles'
import { Card } from '../../components/Card/Card'
import { AdminTabs } from '../../features/admin/components/AdminTabs/AdminTabs'
import { ServerPanel } from '../../features/admin/components/ServerPanel/ServerPanel'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { Page } from './ServerPage.styles'

export function ServerPage() {
  const { currentUser } = useStore()
  const { t } = useI18n()

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <Page>
        <PageHeader>
          <h1>{t.admin.server}</h1>
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
          <h1>{t.admin.server}</h1>
          <p>{t.admin.serverLead}</p>
        </div>
      </PageHeader>
      <AdminTabs current="server" />
      <ServerPanel />
    </Page>
  )
}
