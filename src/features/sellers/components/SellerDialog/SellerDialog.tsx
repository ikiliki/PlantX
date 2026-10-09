import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../../../../i18n/I18nProvider'
import { SellerProfile } from '../SellerProfile/SellerProfile'
import { Backdrop, Close, CloseBar, Dialog } from './SellerDialog.styles'
import { useDialogLayer } from '../../../../lib/dialogLayer'

const TITLE_ID = 'seller-profile-title'

export function SellerDialog({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { t } = useI18n()
  const dialogRef = useRef<HTMLDivElement>(null)

  // A layer: the page behind stays put, and back closes it.
  useDialogLayer(onClose, { history: false })
  useEffect(() => {
    dialogRef.current?.scrollTo(0, 0)
    dialogRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (
        document.getElementById('sell-dialog-title') ||
        document.getElementById('auth-dialog-title') ||
        document.getElementById('market-peek-title') ||
        document.getElementById('plant-passport-title')
      )
        return
      onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose, userId])

  return createPortal(
    <Backdrop onClick={onClose}>
      <Dialog
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        onClick={(event) => event.stopPropagation()}
      >
        <CloseBar>
          <Close type="button" onClick={onClose} aria-label={t.common.cancel}>
            ×
          </Close>
        </CloseBar>
        <SellerProfile key={userId} userId={userId} titleId={TITLE_ID} dialog />
      </Dialog>
    </Backdrop>,
    document.body,
  )
}
