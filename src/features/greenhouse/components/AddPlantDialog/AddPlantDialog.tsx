import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../../../../i18n/I18nProvider'
import { AddPlantForm } from '../AddPlantForm/AddPlantForm'
import { Backdrop, Close, Dialog, Note, Title } from './AddPlantDialog.styles'

export function AddPlantDialog({ onClose }: { onClose: () => void }) {
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
      <Dialog role="dialog" aria-modal="true" aria-labelledby="add-plant-title" onClick={(event) => event.stopPropagation()}>
        <Close type="button" onClick={onClose} aria-label={t.common.cancel}>
          ×
        </Close>
        <Title id="add-plant-title">{t.greenhouse.add}</Title>
        <Note>{t.greenhouse.visitorNote}</Note>
        <AddPlantForm onSaved={onClose} />
      </Dialog>
    </Backdrop>,
    document.body,
  )
}
