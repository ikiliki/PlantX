import type { ReactNode } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import type { PageId } from '../../theme/release'
import { Body, Card, Frame, Mark, Title } from './PageGate.styles'

/**
 * Gates a page route from Admin → System.
 * Under maintenance: one shared notice for every page — no feature peek underneath.
 * Feature readiness is separate; this only cares about page status.
 */
export function PageGate({
  pageId,
  children,
}: {
  pageId: PageId
  children: ReactNode
  /** @deprecated Ignored — maintenance uses one shared notice. */
  title?: string
  /** @deprecated Ignored — maintenance uses one shared notice. */
  body?: string
}) {
  const { t } = useI18n()
  const { db } = useStore()
  const status = db.system.pages[pageId]

  if (status === 'live') return <>{children}</>

  return (
    <Frame data-page={pageId} data-page-mode={status} role="status">
      <Card>
        <Mark>{t.release.maintenance}</Mark>
        <Title>{t.release.maintenanceTitle}</Title>
        <Body>{t.release.maintenanceBody}</Body>
      </Card>
    </Frame>
  )
}
