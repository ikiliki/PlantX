import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { Icon } from '../../../../components/Icon/Icon'
import { SheetGrip, useSheetDrag } from '../../../../components/SheetGrip/SheetGrip'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useDialogLayer } from '../../../../lib/dialogLayer'
import { useStore } from '../../../../mock/store'
import { ownerActivity } from '../../ownerActivity'
import { ActivityThread } from '../ActivityThread/ActivityThread'
import { Backdrop, Bell, Close, Head, Sheet, Title } from './ActivityBell.styles'

const TITLE_ID = 'activity-sheet-title'

function ActivitySheet({ onClose }: { onClose: () => void }) {
  const { fullDb, db, currentUser } = useStore()
  const { t, tr } = useI18n()
  const ownerId = currentUser?.id ?? ''
  const mine = db.plants.filter((plant) => plant.ownerId === ownerId)
  const activity = ownerActivity(fullDb, ownerId, mine, tr, t)
  const drag = useSheetDrag(onClose)
  const sheetRef = useRef<HTMLDivElement | null>(null)

  // A layer: the page behind stays put, and back closes it.
  useDialogLayer(onClose)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      // Escape closes the popup on top first (a passport or moment opened from a row, portaled after the
      // sheet); the sheet waits for the next Escape.
      const sheet = sheetRef.current
      const above = [...document.querySelectorAll('[aria-modal="true"]')].some(
        (node) => sheet && sheet.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING,
      )
      if (above) return
      onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    // Only a tap on the dimmed page closes it: taps inside popups opened from a row bubble here through React.
    <Backdrop onClick={(event) => event.target === event.currentTarget && onClose()}>
      <Sheet
        ref={(node) => {
          sheetRef.current = node
          drag.bind(node)
        }}
        role="dialog"
        aria-labelledby={TITLE_ID}
        data-activity-sheet
      >
        <SheetGrip label={t.common.dragToClose} {...drag.grip} />
        <Head>
          <Title id={TITLE_ID}>{t.greenhouse.activityTitle}</Title>
          <Close type="button" aria-label={t.http.dismiss} onClick={onClose}>
            ×
          </Close>
        </Head>
        <ActivityThread activity={activity} variant="sheet" />
      </Sheet>
    </Backdrop>,
    document.body,
  )
}

/** Phone Greenhouse page: the bell opens the owner's activity as a bottom sheet. Desktop shows the rail instead. */
export function ActivityBell({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const { t } = useI18n()
  const location = useLocation()
  const [open, setOpen] = useState(defaultOpen)
  const skipRouteClose = useRef(true)

  useEffect(() => {
    if (skipRouteClose.current) {
      skipRouteClose.current = false
      return
    }
    setOpen(false)
  }, [location.pathname])

  return (
    <>
      <Bell
        type="button"
        aria-label={t.greenhouse.activityTitle}
        aria-expanded={open}
        aria-haspopup="dialog"
        $open={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="bell" size={20} />
      </Bell>
      {open ? <ActivitySheet onClose={() => setOpen(false)} /> : null}
    </>
  )
}
