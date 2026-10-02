import { Navigate, useLocation } from 'react-router-dom'
import { AppShell } from '../../../../app/AppShell/AppShell'
import { LoaderShell } from '../../../../components/LoaderShell/LoaderShell'
import { useStore } from '../../../../mock/store'
import { isOperator } from '../../../../theme/operator'

/**
 * /admin never shows the public maintenance hold. There is no separate admin sign-in:
 * the operator signs in with Google on /login like everyone else and comes back here.
 */
export function AdminGate() {
  const { currentUser, liveStatus } = useStore()
  const { pathname } = useLocation()

  if (liveStatus === 'loading') return <LoaderShell fill />
  if (isOperator(currentUser)) return <AppShell />
  if (currentUser) return <Navigate to="/home" replace />
  return <Navigate to={`/login?next=${encodeURIComponent(pathname)}`} replace />
}
