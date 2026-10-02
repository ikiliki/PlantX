import type { ReactNode, RefObject } from 'react'
import { createPortal } from 'react-dom'
import { Menu } from '../MarketSearch/MarketSearch.styles'
import { Sheet, SheetBackdrop, SheetGrab } from './PillMenu.styles'

/**
 * A filter pill's menu. Wide screens get the dropdown under the pill. On a phone the pills sit in one
 * row that scrolls sideways, which would clip a dropdown, so the same choices open as a bottom sheet
 * portaled to the body. `sheetRef` lets the pills treat taps inside the sheet as "inside".
 */
export function PillMenu({
  phone,
  flip = false,
  sheetRef,
  label,
  children,
}: {
  phone: boolean
  flip?: boolean
  sheetRef: RefObject<HTMLDivElement | null>
  /** Accessible name for the sheet (the pill's label). */
  label?: string
  children: ReactNode
}) {
  if (!phone) return <Menu $flip={flip}>{children}</Menu>
  return createPortal(
    <SheetBackdrop>
      <Sheet ref={sheetRef} role="dialog" aria-modal="true" aria-label={label}>
        <SheetGrab aria-hidden />
        {children}
      </Sheet>
    </SheetBackdrop>,
    document.body,
  )
}
