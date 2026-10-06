import { useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { Icon } from '../../../../components/Icon/Icon'
import { ModalDialog } from '../../../../components/ModalDialog/ModalDialog'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { Plant } from '../../../../mock/types'
import { Delete, Note, Row, Side, Switch } from './PlantOwnerControls.styles'

/**
 * The owner's own switches on the passport: who sees the plant (Public by default; Private hides it and
 * its activity from everyone but the owner and admins), and Delete (asks first; the plant leaves the
 * greenhouse and its tasks, an admin can restore it). Both write a private activity on the server.
 */
export function PlantOwnerControls({ plant, onDeleted }: { plant: Plant; onDeleted?: () => void }) {
  const { t, tr } = useI18n()
  const { editPlant, deletePlant } = useStore()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteFailed, setDeleteFailed] = useState(false)
  const isPrivate = Boolean(plant.private)

  const choose = async (next: boolean) => {
    if (busy || next === isPrivate) return
    setBusy(true)
    setFailed(false)
    const ok = await editPlant(plant.id, { private: next })
    setBusy(false)
    if (!ok) setFailed(true)
  }

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
    <Row data-plant-owner-controls>
      <Switch role="radiogroup" aria-label={t.passport.privacyLabel}>
        <Side
          type="button"
          role="radio"
          aria-checked={!isPrivate}
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
          $on={isPrivate}
          disabled={busy}
          onClick={() => void choose(true)}
        >
          <Icon name="lock" size={13} />
          {t.passport.private}
        </Side>
      </Switch>
      <Delete type="button" onClick={() => setConfirming(true)}>
        {t.passport.deletePlant}
      </Delete>
      <Note $error={failed} role={failed ? 'alert' : undefined}>
        {failed ? t.edit.failed : isPrivate ? t.passport.privateHint : t.passport.publicHint}
      </Note>

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
    </Row>
  )
}
