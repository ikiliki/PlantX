import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../../../../i18n/I18nProvider'
import { SellPage } from '../../../../pages/SellPage/SellPage'
import { Backdrop, Close, Dialog } from './SellDialog.styles'
import { useDialogLayer } from '../../../../lib/dialogLayer'

export function SellDialog({
  plantId,
  onClose,
}: {
  plantId?: string
  onClose: () => void
}) {
  const { t } = useI18n()

  // A layer: the page behind stays put, and back closes it.
  useDialogLayer(onClose)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
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
