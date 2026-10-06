import { createContext, useContext } from 'react'
import type { NavigationType } from 'react-router-dom'

/**
 * The real navigation type (PUSH / REPLACE / POP) for code under `<Routes location>`.
 * `AppRoutes` passes a location to `<Routes>` (so passports and seller cards can open over a page), and React
 * Router then reports every navigation as POP to everything inside it. `AppShell` reads this instead, so a new
 * page starts at the top (#83).
 */
export const PageNavigationContext = createContext<NavigationType | null>(null)

export function usePageNavigationType(): NavigationType | null {
  return useContext(PageNavigationContext)
}
