import { useEffect, useRef, useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { ChoiceChips } from '../../../../components/ChoiceChips/ChoiceChips'
import { Input, TextArea } from '../../../../components/Form/Form'
import { useI18n } from '../../../../i18n/I18nProvider'
import { Actions, Editor, ErrorText, Pencil } from './InlineEdit.styles'

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
 * Edits one passport value in place (#70): the editor where the value was, Save and Cancel right under it.
 * Nothing saves on change. A refused save keeps the editor open with the error under the field.
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
  /** Resolves true when the server saved it; the caller closes the editor then. */
  onSave: (next: string) => Promise<boolean>
  onCancel: () => void
}) {
  const { t } = useI18n()
  const [draft, setDraft] = useState(value)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const fieldRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

  useEffect(() => {
    fieldRef.current?.focus()
  }, [])

  const blank = required && !draft.trim()
  const unchanged = draft.trim() === value.trim()

  const save = async () => {
    if (blank || unchanged) return
    setBusy(true)
    setFailed(false)
    const ok = await onSave(draft.trim())
    setBusy(false)
    if (!ok) setFailed(true)
  }

  return (
    <Editor
      data-inline-editor={label}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation()
          onCancel()
        }
        if (event.key === 'Enter' && kind === 'text') void save()
      }}
    >
      {kind === 'choice' ? (
        <ChoiceChips label={label} options={options} value={draft} onChange={setDraft} scroll />
      ) : kind === 'textarea' ? (
        <TextArea
          ref={fieldRef}
          aria-label={label}
          value={draft}
          maxLength={maxLength}
          onChange={(event) => setDraft(event.target.value)}
        />
      ) : (
        <Input
          ref={fieldRef}
          aria-label={label}
          value={draft}
          maxLength={maxLength}
          required={required}
          onChange={(event) => setDraft(event.target.value)}
        />
      )}
      <Actions>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
          {t.common.cancel}
        </Button>
        <Button type="button" size="sm" variant="growth" onClick={() => void save()} disabled={busy || blank || unchanged}>
          {busy ? t.common.loading : t.common.save}
        </Button>
      </Actions>
      {failed ? <ErrorText role="alert">{t.edit.failed}</ErrorText> : null}
    </Editor>
  )
}
