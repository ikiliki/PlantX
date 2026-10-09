import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { SheetGrip, useSheetDrag } from '../../../../components/SheetGrip/SheetGrip'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useDialogLayer } from '../../../../lib/dialogLayer'
import type { FeedUpdate } from '../../../../mock/types'
import { CommentThread } from '../CommentThread/CommentThread'
import { Backdrop, Close, Head, Scroll, Sheet, Title } from './CommentSheet.styles'

const TITLE_ID = 'comment-sheet-title'

/** Phone: a post's comments as a bottom sheet (grip, title, ×). Back and Escape close it. */
export function CommentSheet({ update, onClose }: { update: FeedUpdate; onClose: () => void }) {
  const { t } = useI18n()
  const drag = useSheetDrag(onClose)
  const sheetRef = useRef<HTMLDivElement | null>(null)

  useDialogLayer(onClose)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      const sheet = sheetRef.current
      const above = [...document.querySelectorAll('[aria-modal="true"]')].some(
        (node) => sheet && sheet.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING,
      )
      if (!above) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <Backdrop onClick={(event) => event.target === event.currentTarget && onClose()}>
      <Sheet
        ref={(node) => {
          sheetRef.current = node
          drag.bind(node)
        }}
        role="dialog"
        aria-labelledby={TITLE_ID}
        data-comment-sheet
      >
        <SheetGrip label={t.common.dragToClose} {...drag.grip} />
        <Head>
          <Title id={TITLE_ID}>{t.feedPage.commentsTitle}</Title>
          <Close type="button" aria-label={t.common.close} onClick={onClose}>
            ×
          </Close>
        </Head>
        <Scroll>
          <CommentThread update={update} />
        </Scroll>
      </Sheet>
    </Backdrop>,
    document.body,
  )
}
