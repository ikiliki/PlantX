import type { ReactNode } from 'react'
import { PageHeader } from '../../../../app/AppShell/AppShell.styles'
import { Card } from '../../../../components/Card/Card'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { AdminTabs, adminNav } from '../AdminTabs/AdminTabs'
import { Page } from './AdminPage.styles'

export function AdminPage({
  tab,
  title,
  lead,
  children,
}: {
  tab: (typeof adminNav)[number]['id']
  title: string
  lead: string
  children: ReactNode
}) {
  const { currentUser } = useStore()
  const { t } = useI18n()

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <Page>
        <PageHeader>
          <h1>{title}</h1>
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
          <h1>{title}</h1>
          <p>{lead}</p>
        </div>
      </PageHeader>
      <AdminTabs current={tab} />
      {children}
    </Page>
  )
}
