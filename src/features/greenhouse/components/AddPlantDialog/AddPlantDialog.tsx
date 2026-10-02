import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../../../../i18n/I18nProvider'
import { AddPlantWizard } from '../AddPlantWizard/AddPlantWizard'
import { Backdrop, Close, Dialog } from './AddPlantDialog.styles'

export function AddPlantDialog({ onClose, onSaved }: { onClose: () => void; onSaved?: (plantId: string) => void }) {
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
