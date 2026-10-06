import { useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { Icon } from '../../../../components/Icon/Icon'
import { ModalDialog } from '../../../../components/ModalDialog/ModalDialog'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { Plant } from '../../../../mock/types'
import { Delete, DeleteSlot, Note, Row, Side, Switch } from './PlantOwnerControls.styles'

/**
 * Who sees the plant, on its passport (owner only): Public by default; Private hides it and its activity
 * from everyone but the owner and admins. What each side means is its tooltip. Writes a private
 * 'edited' activity on the server.
 */
export function PlantOwnerControls({ plant }: { plant: Plant }) {
  const { t } = useI18n()
  const { editPlant } = useStore()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const isPrivate = Boolean(plant.private)

  const choose = async (next: boolean) => {
    if (busy || next === isPrivate) return
    setBusy(true)
    setFailed(false)
    const ok = await editPlant(plant.id, { private: next })
    setBusy(false)
    if (!ok) setFailed(true)
  }


  return (
    <Row data-plant-owner-controls>
      <Switch role="radiogroup" aria-label={t.passport.privacyLabel}>
        <Side
          type="button"
          role="radio"
          aria-checked={!isPrivate}
          title={t.passport.publicHint}
          $on={!isPrivate}
          disabled={busy}
          onClick={() => void choose(false)}
        >
          <Icon name="globe" size={13} />
          {t.passport.public}
        </Side>
        <Side
          type="button"
          role="radio"
          aria-checked={isPrivate}
          title={t.passport.privateHint}
          $on={isPrivate}
          disabled={busy}
          onClick={() => void choose(true)}
        >
          <Icon name="lock" size={13} />
          {t.passport.private}
        </Side>
      </Switch>
      {failed ? (
        <Note $error role="alert">
          {t.edit.failed}
        </Note>
      ) : null}
    </Row>
  )
}

/**
 * Delete plant, at the bottom of the passport's side column (owner only). Asks first; the plant leaves the
 * greenhouse and its tasks, an admin can restore it, and a private 'deleted' activity stays in the log.
 */
export function PlantDelete({ plant, onDeleted }: { plant: Plant; onDeleted?: () => void }) {
  const { t, tr } = useI18n()
  const { deletePlant } = useStore()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteFailed, setDeleteFailed] = useState(false)
  const remove = async () => {
    setDeleting(true)
    setDeleteFailed(false)
    const ok = await deletePlant(plant.id)
    setDeleting(false)
    if (!ok) {
      setDeleteFailed(true)
      return
    }
    setConfirming(false)
    onDeleted?.()
  }

  return (
    <DeleteSlot>
      <Delete type="button" onClick={() => setConfirming(true)}>
        <Icon name="trash" size={13} />
        {t.passport.deletePlant}
      </Delete>
      {confirming ? (
        <ModalDialog
          title={t.passport.deleteTitle.replace('{name}', tr(plant.title, plant.titleHe))}
          lead={t.passport.deleteLead}
          width={420}
          onClose={() => {
            if (!deleting) setConfirming(false)
          }}
          footer={
            <>
              <Button type="button" variant="ghost" onClick={() => setConfirming(false)} disabled={deleting}>
                {t.common.cancel}
              </Button>
              <Button type="button" variant="danger" onClick={() => void remove()} disabled={deleting} aria-busy={deleting}>
                {t.passport.deleteConfirm}
              </Button>
            </>
          }
        >
          {deleteFailed ? <Note $error role="alert">{t.passport.deleteFailed}</Note> : null}
        </ModalDialog>
      ) : null}
    </DeleteSlot>
  )
}
