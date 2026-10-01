import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../../../../i18n/I18nProvider'
import { PlantPassport } from '../PlantPassport/PlantPassport'
import { Backdrop, Close, CloseBar, Dialog } from './PassportDialog.styles'

export function PassportDialog({
  plantId,
  onClose,
  tab = 'grading',
  activityKey,
}: {
  plantId: string
  onClose: () => void
  tab?: 'grading' | 'activity' | 'market'
  activityKey?: string
}) {
  const { t } = useI18n()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.scrollTo(0, 0)
    dialogRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (document.getElementById('sell-dialog-title') || document.getElementById('auth-dialog-title')) return
      onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose, plantId])

  return createPortal(
    <Backdrop onClick={onClose}>
      <Dialog
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="plant-passport-title"
        onClick={(event) => event.stopPropagation()}
      >
        <CloseBar>
          <Close type="button" onClick={onClose} aria-label={t.common.cancel}>
            ×
          </Close>
        </CloseBar>
        <PlantPassport key={plantId} plantId={plantId} embedded dialog initialTab={tab} activityKey={activityKey} />
      </Dialog>
    </Backdrop>,
    document.body,
  )
}
