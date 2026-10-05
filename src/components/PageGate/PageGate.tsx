import type { ReactNode } from 'react'
import { HoldNotice } from '../HoldNotice/HoldNotice'
import { useStore } from '../../mock/store'
import type { PageId } from '../../theme/release'

/**
 * Gates a page route from Admin → System.
 * Under maintenance: the same full-screen hold as not-launched, covering the app header.
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
  const { db } = useStore()
  if (db.system.pages[pageId] === 'live') return <>{children}</>
  return <HoldNotice mode="maintenance" pageId={pageId} cover />
}
