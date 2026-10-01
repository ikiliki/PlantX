import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../../../../i18n/I18nProvider'
import { SellPage } from '../../../../pages/SellPage/SellPage'
import { Backdrop, Close, Dialog } from './SellDialog.styles'

export function SellDialog({
  plantId,
  onClose,
}: {
  plantId?: string
  onClose: () => void
}) {
  const { t } = useI18n()

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return createPortal(
    <Backdrop onClick={onClose}>
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="sell-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <Close type="button" onClick={onClose} aria-label={t.common.cancel}>
          ×
        </Close>
        <SellPage plantId={plantId} onPublished={onClose} />
      </Dialog>
    </Backdrop>,
    document.body,
  )
}
