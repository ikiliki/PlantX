import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { SellDialog } from './components/SellDialog/SellDialog'

type SellContextValue = {
  openSell: (plantId?: string) => void
  closeSell: () => void
}

const SellContext = createContext<SellContextValue | null>(null)

export function SellProvider({ children }: { children: ReactNode }) {
  const { signedIn, openAuth } = useAuth()
  const [target, setTarget] = useState<{ plantId?: string } | null>(null)
  const openSell = useCallback(
    (plantId?: string) => {
      const show = () => setTarget({ plantId })
      if (!signedIn) openAuth('sell', show)
      else show()
    },
    [openAuth, signedIn],
  )
  const closeSell = useCallback(() => setTarget(null), [])
  const value = useMemo(() => ({ openSell, closeSell }), [openSell, closeSell])

  return (
    <SellContext.Provider value={value}>
      {children}
      {target && (
        <SellDialog key={target.plantId ?? 'new'} plantId={target.plantId} onClose={closeSell} />
      )}
    </SellContext.Provider>
  )
}

export function useSell() {
  const ctx = useContext(SellContext)
  if (!ctx) throw new Error('useSell must be used within SellProvider')
  return ctx
}
