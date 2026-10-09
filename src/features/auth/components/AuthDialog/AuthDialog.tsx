import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { AuthReason } from '../../AuthProvider'
import { AuthPanel } from '../AuthPanel/AuthPanel'
import { Backdrop, Close, Frame } from './AuthDialog.styles'
import { useDialogLayer } from '../../../../lib/dialogLayer'

export function AuthDialog({
  reason,
  mode,
  onClose,
  onSuccess,
}: {
  reason: AuthReason
  mode?: 'login' | 'register'
  onClose: () => void
  onSuccess: () => void
}) {
  const { t } = useI18n()

  // A layer: the page behind stays put, and back closes it.
  useDialogLayer(onClose)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopImmediatePropagation()
      onClose()
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
    }
  }, [onClose])

  return createPortal(
    <Backdrop onClick={onClose}>
      <Frame
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <Close type="button" onClick={onClose} aria-label={t.common.cancel}>
          ×
        </Close>
        <AuthPanel reason={reason} start={mode} dialog onSuccess={onSuccess} onGuest={onClose} />
      </Frame>
    </Backdrop>,
    document.body,
  )
}
