import type { ReactNode } from 'react'
import { Card } from '../../../../components/Card/Card'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { AdminTabs, adminNav } from '../AdminTabs/AdminTabs'
import { Page } from './AdminPage.styles'

export function AdminPage({
  tab,
  children,
}: {
  tab: (typeof adminNav)[number]['id']
  children: ReactNode
}) {
  const { currentUser } = useStore()
  const { t } = useI18n()

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <Page>
        <Card>
          <p>{t.common.guestBlocked}</p>
        </Card>
      </Page>
    )
  }

  return (
    <Page>
      <AdminTabs current={tab} />
      {children}
    </Page>
  )
}
