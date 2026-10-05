import { useEffect, useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { Field, TextArea } from '../../../../components/Form/Form'
import { ModalDialog } from '../../../../components/ModalDialog/ModalDialog'
import { useI18n } from '../../../../i18n/I18nProvider'
import { notifyInfo } from '../../../../lib/httpNotice'
import { fetchModerationImpact, postModeration } from '../../../../mock/liveApi'
import { useStore } from '../../../../mock/store'
import type { ModerationAction, ModerationImpact, ModerationTarget, Visibility } from '../../../../mock/types'
import { ErrorText, Impact, ImpactList } from './ModerationDialog.styles'

export type ModerationRequest = {
  type: ModerationTarget
  id: string
  label: string
  action: Exclude<ModerationAction, 'edit'>
}

const NEXT: Record<ModerationRequest['action'], Visibility> = {
  hide: 'hidden',
  show: 'visible',
  delete: 'deleted',
  restore: 'visible',
}

/**
 * Confirm a hide / show / delete / restore (#69). Before: what the cascade reaches (from the server).
 * After: a note saying what changed. Mock mode has no server, so it only flips the row locally.
 */
export function ModerationDialog({
  request,
  onClose,
  onDone,
}: {
  request: ModerationRequest
  onClose: () => void
  onDone?: (visibility: Visibility) => void
}) {
  const { t } = useI18n()
  const { plantxEnv, noteVisibility } = useStore()
  const mock = plantxEnv === 'mock'
  const [impact, setImpact] = useState<ModerationImpact | null>(mock ? { plants: 0, activities: 0, todos: 0 } : null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const removing = request.action === 'hide' || request.action === 'delete'

  useEffect(() => {
    if (mock) return
    let live = true
    void fetchModerationImpact(request.type, request.id).then((outcome) => {
      if (!live) return
      if (outcome.ok) setImpact(outcome.data.impact)
      else setFailed(true)
    })
    return () => {
      live = false
    }
  }, [mock, request.type, request.id])

  const parts = (counts: ModerationImpact) =>
    [
      counts.plants ? t.moderation.countPlants.replace('{n}', String(counts.plants)) : '',
      counts.activities ? t.moderation.countActivities.replace('{n}', String(counts.activities)) : '',
      counts.todos ? t.moderation.countTodos.replace('{n}', String(counts.todos)) : '',
    ].filter(Boolean)

  const confirm = async () => {
    setBusy(true)
    setFailed(false)
    let counts = impact ?? { plants: 0, activities: 0, todos: 0 }
    if (!mock) {
      const outcome = await postModeration(request.type, request.id, request.action, reason)
      if (!outcome.ok) {
        setBusy(false)
        setFailed(true)
        return
      }
      counts = outcome.data.impact
    }
    const visibility = NEXT[request.action]
    noteVisibility(request.type, request.id, visibility)
    const reached = parts(counts)
    notifyInfo(
      t.moderation.done[request.action].replace('{name}', request.label),
      reached.length > 0
        ? (removing ? t.moderation.doneAlsoHidden : t.moderation.doneAlsoBack).replace('{list}', reached.join(' · '))
        : undefined,
    )
    setBusy(false)
    onDone?.(visibility)
    onClose()
  }

  const reached = impact ? parts(impact) : []
  const title = t.moderation.confirm[request.action].replace('{name}', request.label)

  return (
    <ModalDialog
      title={title}
      lead={t.moderation.lead[request.action]}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button
            type="button"
            variant={removing ? 'danger' : 'growth'}
            disabled={busy || impact === null}
            onClick={() => void confirm()}
            data-moderation-confirm
          >
            {busy ? t.common.loading : t.moderation.action[request.action]}
          </Button>
        </>
      }
    >
      <Impact role="status" aria-live="polite">
        {impact === null && !failed ? (
          t.common.loading
        ) : reached.length > 0 ? (
          <>
            {removing ? t.moderation.alsoHides : t.moderation.alsoBrings}
            <ImpactList>
              {reached.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ImpactList>
          </>
        ) : (
          t.moderation.nothingElse
        )}
      </Impact>
      <Field>
        {t.moderation.reason}
        <TextArea
          value={reason}
          maxLength={300}
          placeholder={t.moderation.reasonPlaceholder}
          onChange={(event) => setReason(event.target.value)}
        />
      </Field>
      {failed ? <ErrorText role="alert">{t.moderation.failed}</ErrorText> : null}
    </ModalDialog>
  )
}
