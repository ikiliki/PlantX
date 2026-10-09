import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../../../../i18n/I18nProvider'
import { AddPlantWizard } from '../AddPlantWizard/AddPlantWizard'
import { Backdrop, Close, Dialog } from './AddPlantDialog.styles'
import { useDialogLayer } from '../../../../lib/dialogLayer'

export function AddPlantDialog({ onClose, onSaved }: { onClose: () => void; onSaved?: (plantId: string) => void }) {
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
      <Dialog role="dialog" aria-modal="true" aria-label={t.addPlant.title} onClick={(event) => event.stopPropagation()}>
        <Close type="button" onClick={onClose} aria-label={t.common.cancel}>
          ×
        </Close>
        <AddPlantWizard
          onClose={onClose}
          onSaved={(plantId) => {
            onSaved?.(plantId)
            onClose()
          }}
        />
      </Dialog>
    </Backdrop>,
    document.body,
  )
}
