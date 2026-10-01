import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useStore } from '../../mock/store'
import { AuthDialog } from './components/AuthDialog/AuthDialog'

export type AuthReason = 'buy' | 'sell' | 'history' | 'sensitive' | 'rank'

type Pending = { reason: AuthReason; mode?: 'login' | 'register'; onSuccess?: () => void }

type AuthContextValue = {
  signedIn: boolean
  openAuth: (reason: AuthReason, onSuccess?: () => void, mode?: 'login' | 'register') => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { signedIn } = useStore()
  const [pending, setPending] = useState<Pending | null>(null)

  const openAuth = useCallback(
    (reason: AuthReason, onSuccess?: () => void, mode?: 'login' | 'register') => {
      if (signedIn) {
        onSuccess?.()
        return
      }
      setPending({ reason, mode, onSuccess })
    },
    [signedIn],
  )

  const close = useCallback(() => setPending(null), [])
  const succeed = useCallback(() => {
    const done = pending?.onSuccess
    setPending(null)
    done?.()
  }, [pending])

  const value = useMemo(() => ({ signedIn, openAuth }), [signedIn, openAuth])

  return (
    <AuthContext.Provider value={value}>
      {children}
      {pending && <AuthDialog reason={pending.reason} mode={pending.mode} onClose={close} onSuccess={succeed} />}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
