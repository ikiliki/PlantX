import { FormEvent, useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { Field, FormGrid, FormRow, Input } from '../../../../components/Form/Form'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { CatalogProperty, CatalogPropertyOption } from '../../../../mock/types'
import { normalizeSign, SYSTEM_PROPERTY_IDS } from '../../catalogMutations'
import { Backdrop, Close, Dialog, Footer, Title } from './CatalogEditorDialog.styles'
import { AddChip, Check, Chip, FieldError, Lead, TagRow } from './CatalogEditor.styles'

export type PropertyDraft = {
  id?: string
  name: string
  nameHe: string
  required: boolean
  inMarketName: boolean
  sign: string
  options: CatalogPropertyOption[]
}

type OptionDraft = { label: string; labelHe: string; sign: string }
const emptyOption: OptionDraft = { label: '', labelHe: '', sign: '' }

export function PropertyEditorDialog({
  scopeLabel,
  initial,
  takenSigns,
  forceRequired = false,
  defaultRequired = false,
  onConfirm,
  onDelete,
  onClose,
}: {
  scopeLabel: string
  initial?: CatalogProperty
  takenSigns: string[]
  forceRequired?: boolean
  defaultRequired?: boolean
  onConfirm: (draft: PropertyDraft) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const { t } = useI18n()
  const [name, setName] = useState(initial?.name ?? '')
  const [nameHe, setNameHe] = useState(initial?.nameHe ?? '')
  const [required, setRequired] = useState(forceRequired ? true : (initial?.required ?? defaultRequired))
  const [inMarketName, setInMarketName] = useState(initial?.inMarketName ?? false)
  const [sign, setSign] = useState(initial?.sign ?? '')
  const [signError, setSignError] = useState('')
  const [options, setOptions] = useState<CatalogPropertyOption[]>(initial?.options ?? [])
  const [editing, setEditing] = useState<number | 'new' | null>(null)
  const [draftOption, setDraftOption] = useState<OptionDraft>(emptyOption)
  const [optionError, setOptionError] = useState('')
  const systemProperty = initial ? SYSTEM_PROPERTY_IDS.has(initial.id) : false

  const startNew = () => {
    setEditing('new')
    setDraftOption(emptyOption)
    setOptionError('')
  }

  const startEdit = (index: number) => {
    const option = options[index]
    setEditing(index)
    setDraftOption({ label: option.label, labelHe: option.labelHe, sign: option.sign })
    setOptionError('')
  }

  const commitOption = () => {
    const label = draftOption.label.trim()
    const nextSign = normalizeSign(draftOption.sign)
    if (!label || !/^[A-Z]{1,3}$/.test(nextSign)) {
      setOptionError(t.admin.signInvalid)
      return
    }
    const taken = options.some((option, index) => option.sign === nextSign && index !== editing)
    if (taken) {
      setOptionError(t.admin.signTaken)
      return
    }
    const row: CatalogPropertyOption = {
      id: editing === 'new' || editing === null ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || nextSign.toLowerCase() : options[editing].id,
      label,
      labelHe: draftOption.labelHe.trim() || label,
      sign: nextSign,
    }
    setOptions((current) => {
      if (editing === 'new' || editing === null) return [...current, row]
      return current.map((option, index) => (index === editing ? row : option))
    })
    setEditing(null)
    setDraftOption(emptyOption)
    setOptionError('')
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const nextSign = inMarketName ? normalizeSign(sign) : ''
    if (inMarketName && !/^[A-Z]{1,3}$/.test(nextSign)) {
      setSignError(t.admin.signInvalid)
      return
    }
    if (inMarketName && takenSigns.includes(nextSign)) {
      setSignError(t.admin.signTaken)
      return
    }
    if (options.length === 0) {
      setOptionError(t.admin.signInvalid)
      return
    }
    setSignError('')
    onConfirm({ id: initial?.id, name, nameHe, required, inMarketName, sign: nextSign, options })
  }

  return (
    <Backdrop onClick={onClose}>
      <Dialog role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <Close type="button" onClick={onClose} aria-label={t.common.cancel}>
          ×
        </Close>
        <Title>{initial ? t.admin.editProperty : t.admin.addProperty}</Title>
        <Lead style={{ marginBottom: 12 }}>{scopeLabel}</Lead>
        <form onSubmit={submit}>
          <FormGrid>
            <FormRow>
              <Field>
                {t.admin.nameEn}
                <Input value={name} onChange={(event) => setName(event.target.value)} required />
              </Field>
              <Field>
                {t.admin.nameHe}
                <Input value={nameHe} onChange={(event) => setNameHe(event.target.value)} />
              </Field>
            </FormRow>
            <Field>
              {t.admin.optionsEn}
              <Lead>{t.admin.optionsHint}</Lead>
              <TagRow>
                {options.map((option, index) => (
                  <Chip key={`${option.id}-${option.sign}`} type="button" $active={editing === index} onClick={() => startEdit(index)}>
                    {option.label} ({option.sign})
                  </Chip>
                ))}
                <AddChip type="button" onClick={startNew}>
                  {t.admin.addOption}
                </AddChip>
              </TagRow>
              {editing !== null && (
                <FormRow>
                  <Field>
                    {t.admin.optionName}
                    <Input
                      value={draftOption.label}
                      onChange={(event) => setDraftOption((current) => ({ ...current, label: event.target.value }))}
                    />
                  </Field>
                  <Field>
                    {t.admin.nameHe}
                    <Input
                      value={draftOption.labelHe}
                      onChange={(event) => setDraftOption((current) => ({ ...current, labelHe: event.target.value }))}
                    />
                  </Field>
                  <Field>
                    {t.admin.optionSign}
                    <Input
                      value={draftOption.sign}
                      maxLength={3}
                      onChange={(event) =>
                        setDraftOption((current) => ({ ...current, sign: normalizeSign(event.target.value) }))
                      }
                    />
                  </Field>
                </FormRow>
              )}
              {editing !== null && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button type="button" size="sm" onClick={commitOption}>
                    {t.common.confirm}
                  </Button>
                  {typeof editing === 'number' && (
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        setOptions((current) => current.filter((_, index) => index !== editing))
                        setEditing(null)
                      }}
                    >
                      {t.admin.delete}
                    </Button>
                  )}
                </div>
              )}
              {optionError ? <FieldError>{optionError}</FieldError> : null}
            </Field>
            <Check>
              <input
                type="checkbox"
                checked={forceRequired || required}
                onChange={(event) => setRequired(event.target.checked)}
                disabled={systemProperty || forceRequired}
              />
              {t.admin.required}
            </Check>
            <Check>
              <input
                type="checkbox"
                checked={inMarketName}
                onChange={(event) => {
                  setInMarketName(event.target.checked)
                  setSignError('')
                  if (!event.target.checked) setSign('')
                }}
              />
              {t.admin.inMarketName}
            </Check>
            {inMarketName && (
              <Field>
                {t.admin.sign}
                <Lead>{t.admin.optionsHint}</Lead>
                <Input
                  value={sign}
                  maxLength={3}
                  placeholder={t.admin.signHint}
                  onChange={(event) => {
                    setSign(normalizeSign(event.target.value))
                    setSignError('')
                  }}
                  required
                />
                {signError ? <FieldError>{signError}</FieldError> : null}
              </Field>
            )}
            <Footer>
              {initial && onDelete && !systemProperty ? (
                <Button type="button" variant="danger" size="sm" onClick={onDelete}>
                  {t.admin.delete}
                </Button>
              ) : (
                <span />
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                  {t.common.cancel}
                </Button>
                <Button type="submit" size="sm">
                  {t.common.confirm}
                </Button>
              </div>
            </Footer>
          </FormGrid>
        </form>
      </Dialog>
    </Backdrop>
  )
}
