import { useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { ModalDialog } from '../../../../components/ModalDialog/ModalDialog'
import { useI18n } from '../../../../i18n/I18nProvider'
import { Counts, ErrorText } from './DeleteAccountDialog.styles'

/**
 * Confirm for Account → Delete my account. Erasing is real and immediate (plants, photos, activity, tasks,
 * scans), so the button says so and the plant count is shown. `onDelete` resolves false when it failed.
 */
export function DeleteAccountDialog({
  plants,
  onDelete,
  onClose,
}: {
  plants: number
  onDelete: () => Promise<boolean>
  onClose: () => void
}) {
  const { t } = useI18n()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const confirm = async () => {
    setBusy(true)
    setFailed(false)
    const ok = await onDelete()
    setBusy(false)
    if (!ok) setFailed(true)
  }

  return (
    <ModalDialog
      title={t.legal.deleteTitle}
      lead={t.legal.deleteBody}
      onClose={busy ? () => undefined : onClose}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
            {t.common.cancel}
          </Button>
          <Button type="button" variant="danger" onClick={() => void confirm()} disabled={busy} data-delete-account-confirm>
            {busy ? t.legal.deleting : t.legal.deleteConfirm}
          </Button>
        </>
      }
    >
      {plants > 0 ? <Counts>{t.legal.deleteCounts.replace('{plants}', String(plants))}</Counts> : null}
      {failed ? <ErrorText role="alert">{t.legal.deleteFailed}</ErrorText> : null}
    </ModalDialog>
  )
}
