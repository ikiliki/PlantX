import { useEffect } from 'react'
import { AppShell } from '../../../../app/AppShell/AppShell'
import { HoldNotice } from '../../../../components/HoldNotice/HoldNotice'
import { HoldStage } from '../../../../components/HoldStage/HoldStage'
import { LoaderShell } from '../../../../components/LoaderShell/LoaderShell'
import { AuthPanel } from '../../../auth/components/AuthPanel/AuthPanel'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { isOperator } from '../../../../theme/operator'

/** /admin stays open. Signed-out visitors get the same full-screen hold, with Google only. */
export function AdminGate() {
  const { t } = useI18n()
  const { currentUser, liveStatus, loginAs } = useStore()
  const allowed = isOperator(currentUser)

  useEffect(() => {
    if (currentUser && !isOperator(currentUser)) loginAs(null)
  }, [currentUser, loginAs])

  if (liveStatus === 'loading') return <LoaderShell fill />
  if (liveStatus === 'down') return <HoldNotice mode="maintenance" />
  if (allowed) return <AppShell />

  return (
    <HoldStage mode="admin" mark={t.admin.title} title={t.auth.google} body={t.admin.operatorOnly}>
      <AuthPanel embedded ssoOnly titleId="admin-sso-title" onSuccess={() => undefined} />
    </HoldStage>
  )
}
