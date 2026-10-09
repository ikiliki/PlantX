import { useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { TodoSubcategory } from '../../../../mock/types'
import { GuestView } from '../../../../components/GuestView/GuestView'
import { SheetGrip, useSheetDrag } from '../../../../components/SheetGrip/SheetGrip'
import { useDialogLayer } from '../../../../lib/dialogLayer'
import { forAudience } from '../../../../theme/audience'
import { PlantPassport } from '../PlantPassport/PlantPassport'
import { Backdrop, Close, CloseBar, Dialog, GuestPane } from './PassportDialog.styles'

export function PassportDialog({
  plantId,
  onClose,
  tab = 'grading',
  activityKey,
  careMark,
  routed = false,
}: {
  plantId: string
  onClose: () => void
  tab?: 'grading' | 'todo' | 'activity' | 'market'
  activityKey?: string
  careMark?: TodoSubcategory
  /** Opened by its own URL (`/plants/:id`): back already closes it, so it adds no history entry of its own. */
  routed?: boolean
}) {
  const { t } = useI18n()
  const { signedIn } = useStore()
  const dialogRef = useRef<HTMLDivElement>(null)
  const sheet = useSheetDrag(onClose)
  // A layer: pull to refresh leaves the page alone, and back closes the passport.
  useDialogLayer(onClose, { history: !routed })

  useLayoutEffect(() => {
    const y = window.scrollY
    const openedOn = window.location.pathname
    const html = document.documentElement
    const body = document.body
    const previous = {
      bodyOverflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    }
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${y}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    dialogRef.current?.focus({ preventScroll: true })
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (document.getElementById('sell-dialog-title') || document.getElementById('auth-dialog-title')) return
      onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      body.style.overflow = previous.bodyOverflow
      body.style.position = previous.position
      body.style.top = previous.top
      body.style.left = previous.left
      body.style.right = previous.right
      body.style.width = previous.width
      // Closing goes back to the same spot on the page. A link inside the passport went to a new page
      // instead, which starts at the top (#83); a `/plants/:id` overlay closes back to its page either way.
      const samePage = window.location.pathname === openedOn || openedOn.startsWith('/plants/')
      if (samePage) {
        const behavior = html.style.scrollBehavior
        html.style.scrollBehavior = 'auto'
        window.scrollTo(0, y)
        html.style.scrollBehavior = behavior
      }
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose, plantId])

  return createPortal(
    <Backdrop onClick={onClose}>
      <Dialog
        ref={(node) => {
          dialogRef.current = node
          sheet.bind(node)
        }}
        $fit={!signedIn}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={signedIn ? 'plant-passport-title' : undefined}
        aria-label={signedIn ? undefined : t.guest.passportTitle}
        onClick={(event) => event.stopPropagation()}
      >
        <SheetGrip label={t.common.dragToClose} {...sheet.grip} />
        <CloseBar>
          <Close type="button" onClick={onClose} aria-label={t.common.cancel}>
            ×
          </Close>
        </CloseBar>
        {forAudience(signedIn, {
          guest: (
            <GuestPane>
              <GuestView title={t.guest.passportTitle} body={t.guest.passportBody} action={t.guest.logIn} />
            </GuestPane>
          ),
          signedIn: (
            <PlantPassport key={plantId} plantId={plantId} embedded dialog initialTab={tab} activityKey={activityKey} careMark={careMark} />
          ),
        })}
      </Dialog>
    </Backdrop>,
    document.body,
  )
}
