import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../../i18n/I18nProvider'
import { Backdrop, Body, Close, Footer, Frame, Head, Lead, Title } from './ModalDialog.styles'
import { useDialogLayer } from '../../lib/dialogLayer'

/**
 * Small form dialog: title, optional lead, body, footer actions. Portaled above other dialogs,
 * Escape and the backdrop close it, the page behind does not scroll. A phone gets a bottom sheet.
 * `dismissible={false}` (the consent gate) has no ×, and Escape and the backdrop do nothing.
 */
export function ModalDialog({
  title,
  lead,
  children,
  footer,
  onClose,
  width = 460,
  dismissible = true,
}: {
  title: string
  lead?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  onClose: () => void
  width?: number
  dismissible?: boolean
}) {
  const { t } = useI18n()
  const titleId = useId()
  const closeRef = useRef(onClose)
  closeRef.current = dismissible ? onClose : () => undefined

  // A layer: the page behind stays put, and back closes it.
  useDialogLayer(() => closeRef.current(), { history: dismissible })
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopImmediatePropagation()
      closeRef.current()
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
    }
  }, [])

  return createPortal(
    <Backdrop onClick={() => closeRef.current()}>
      <Frame
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        $width={width}
        onClick={(event) => event.stopPropagation()}
      >
        {dismissible ? (
          <Close type="button" onClick={onClose} aria-label={t.common.close}>
            ×
          </Close>
        ) : null}
        <Head>
          <Title id={titleId}>{title}</Title>
          {lead ? <Lead>{lead}</Lead> : null}
        </Head>
        {children ? <Body>{children}</Body> : null}
        {footer ? <Footer>{footer}</Footer> : null}
      </Frame>
    </Backdrop>,
    document.body,
  )
}
