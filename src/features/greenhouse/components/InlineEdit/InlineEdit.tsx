import { useEffect, useRef, useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { ChoiceChips } from '../../../../components/ChoiceChips/ChoiceChips'
import { Input, TextArea } from '../../../../components/Form/Form'
import { ModalDialog } from '../../../../components/ModalDialog/ModalDialog'
import { useI18n } from '../../../../i18n/I18nProvider'
import { Editor, Pencil, Status } from './InlineEdit.styles'

export type InlineEditKind = 'text' | 'textarea' | 'choice'

/**
 * The small pencil next to a passport value (#70). Only the owner and the admin see it.
 * The aria-label names the field, so "Edit Size" and "Edit Stage" stay apart for screen readers.
 */
export function EditPencil({ label, onClick }: { label: string; onClick: () => void }) {
  const { t } = useI18n()
  return (
    <Pencil type="button" aria-label={t.passport.editField.replace('{field}', label)} onClick={onClick} data-inline-edit={label}>
      ✎
    </Pencil>
  )
}

/**
 * Edits one passport value in a small popup (#70), so the passport behind it never reflows: "Edit <field>",
 * the field, Cancel and Save in the footer. Nothing saves on change. One fixed status line under the field
 * holds the character count or a refused save's error, so the popup keeps its size.
 */
export function InlineEdit({
  label,
  kind,
  value,
  options = [],
  required = false,
  maxLength,
  onSave,
  onCancel,
}: {
  label: string
  kind: InlineEditKind
  value: string
  options?: { id: string; label: string }[]
  required?: boolean
  maxLength?: number
  /** Resolves true when the server saved it; the caller closes the popup then. */
  onSave: (next: string) => Promise<boolean>
  onCancel: () => void
}) {
  const { t } = useI18n()
  const [draft, setDraft] = useState(value)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const fieldRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

  useEffect(() => {
    const field = fieldRef.current
    if (!field) return
    field.focus()
    const end = field.value.length
    field.setSelectionRange(end, end)
  }, [])

  const blank = required && !draft.trim()
  const unchanged = draft.trim() === value.trim()

  const save = async () => {
    if (busy || blank || unchanged) return
    setBusy(true)
    setFailed(false)
    const ok = await onSave(draft.trim())
    setBusy(false)
    if (!ok) setFailed(true)
  }

  const edit = (next: string) => {
    setFailed(false)
    setDraft(next)
  }

  return (
    <ModalDialog
      title={t.passport.editField.replace('{field}', label)}
      width={kind === 'choice' ? 480 : 440}
      onClose={() => {
        if (!busy) onCancel()
      }}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
            {t.common.cancel}
          </Button>
          <Button
            type="button"
            variant="growth"
            onClick={() => void save()}
            disabled={busy || blank || unchanged}
            aria-busy={busy}
          >
            {t.common.save}
          </Button>
        </>
      }
    >
      <Editor
        data-inline-editor={label}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && kind === 'text') void save()
        }}
      >
        {kind === 'choice' ? (
          <ChoiceChips label={label} options={options} value={draft} onChange={edit} />
        ) : kind === 'textarea' ? (
          <TextArea
            ref={fieldRef}
            aria-label={label}
            rows={5}
            value={draft}
            maxLength={maxLength}
            onChange={(event) => edit(event.target.value)}
          />
        ) : (
          <Input
            ref={fieldRef}
            aria-label={label}
            value={draft}
            maxLength={maxLength}
            required={required}
            onChange={(event) => edit(event.target.value)}
          />
        )}
        <Status $error={failed} role={failed ? 'alert' : undefined}>
          {failed ? t.edit.failed : maxLength && kind !== 'choice' ? `${draft.length} / ${maxLength}` : ''}
        </Status>
      </Editor>
    </ModalDialog>
  )
}
