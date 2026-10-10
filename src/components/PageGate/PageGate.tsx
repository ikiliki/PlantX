import type { ReactNode } from 'react'
import { HoldNotice } from '../HoldNotice/HoldNotice'
import { useStore } from '../../mock/store'
import { useDevice } from '../../lib/useDevice'
import { isPageLive, type PageId } from '../../theme/release'

/**
 * Gates a page route from Admin → System.
 * Under maintenance, or switched off for this device (phone / desktop): the same full-screen hold as not-launched, covering the app header.
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
  const device = useDevice()
  if (isPageLive(db.system, pageId, device)) return <>{children}</>
  return <HoldNotice mode="maintenance" pageId={pageId} cover />
}
