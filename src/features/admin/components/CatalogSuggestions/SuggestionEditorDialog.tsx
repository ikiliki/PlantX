import { FormEvent, useRef, useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { Field, FormGrid, FormRow, Input, Select } from '../../../../components/Form/Form'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { createCatalog } from '../../../../mock/catalog'
import { defaultPlantPhoto } from '../../../../mock/images'
import { useStore } from '../../../../mock/store'
import type { CatalogSuggestion, CatalogSuggestionDraft, SuggestedProperty } from '../../../../mock/types'
import { readPhotoFile } from '../../../../utils/readPhoto'
import { normalizeSign } from '../../catalogMutations'
import { Check, FieldError } from '../CatalogEditor/CatalogEditor.styles'
import {
  Backdrop,
  Close,
  Footer,
  PhotoCopy,
  PhotoPreview,
  PhotoRow,
  Title,
} from '../CatalogEditor/CatalogEditorDialog.styles'
import { Card, Dialog, Lead, Note, OptionRow, RowActions, Section, SectionTitle } from './SuggestionEditor.styles'

function letters(value: string, max: number) {
  return value.toUpperCase().replace(/[^A-Za-z0-9]/g, '').slice(0, max)
}

export function draftFromSuggestion(item: CatalogSuggestion): CatalogSuggestionDraft {
  const ticker = letters(item.genus || item.scientificName, 4) || 'PLNT'
  const base: CatalogSuggestionDraft = item.draft?.category?.name
    ? structuredClone(item.draft)
    : {
        category: { name: item.name, nameHe: '', ticker, photo: '' },
        subcategory: { name: item.name, nameHe: '', code: ticker.slice(0, 6), photo: '' },
        properties: [],
      }
  return {
    ...base,
    category: { ...base.category, photo: base.category.photo || defaultPlantPhoto },
    subcategory: { ...base.subcategory, photo: base.subcategory.photo || defaultPlantPhoto },
    properties: base.properties ?? [],
  }
}

function emptyProperty(): SuggestedProperty {
  return {
    name: '',
    nameHe: '',
    required: false,
    inMarketName: false,
    sign: '',
    scope: 'category',
    options: [{ label: '', labelHe: '', sign: '' }],
  }
}

export function SuggestionEditorDialog({
  suggestion,
  onClose,
  onConfirm,
}: {
  suggestion: CatalogSuggestion
  onClose: () => void
  onConfirm: (draft: CatalogSuggestionDraft) => boolean
}) {
  const { t } = useI18n()
  const { db } = useStore()
  const catalog = db.catalog ?? createCatalog()
  const categoryPhoto = useRef<HTMLInputElement>(null)
  const subcategoryPhoto = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState(() => draftFromSuggestion(suggestion))
  const [error, setError] = useState('')
  /** Admin's own new entry: no suggestion behind it. */
  const fresh = !suggestion.id
  const variety = draft.categoryId ? catalog.categories.find((item) => item.id === draft.categoryId) : undefined

  const setCategory = (patch: Partial<CatalogSuggestionDraft['category']>) =>
    setDraft((current) => ({ ...current, category: { ...current.category, ...patch } }))
  const setSub = (patch: Partial<CatalogSuggestionDraft['subcategory']>) =>
    setDraft((current) => ({ ...current, subcategory: { ...current.subcategory, ...patch } }))
  const setProperty = (index: number, patch: Partial<SuggestedProperty>) =>
    setDraft((current) => ({
      ...current,
      properties: current.properties.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }))

  const readInto = (file: File | undefined, apply: (photo: string) => void) => {
    if (!file) return
    void readPhotoFile(file).then(apply)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const signs = draft.properties.filter((item) => item.inMarketName).map((item) => normalizeSign(item.sign))
    const broken = draft.properties.some((item) => {
      const options = item.options.filter((option) => option.label.trim() && normalizeSign(option.sign))
      if (!item.name.trim() || options.length === 0) return true
      return item.inMarketName && !/^[A-Z]{1,3}$/.test(normalizeSign(item.sign))
    })
    if (broken || new Set(signs).size !== signs.length) {
      setError(t.admin.suggestedPropertyInvalid)
      return
    }
    const next: CatalogSuggestionDraft = {
      ...draft,
      category: { ...draft.category, ticker: letters(draft.category.ticker, 6) },
      subcategory: {
        ...draft.subcategory,
        code: draft.subcategory.code
          .trim()
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 8),
      },
      properties: draft.properties.map((item) => ({
        ...item,
        sign: item.inMarketName ? normalizeSign(item.sign) : '',
        options: item.options
          .filter((option) => option.label.trim() && normalizeSign(option.sign))
          .map((option) => ({
            label: option.label.trim(),
            labelHe: option.labelHe.trim() || option.label.trim(),
            sign: normalizeSign(option.sign),
          })),
      })),
    }
    if (!onConfirm(next)) {
      setError(t.admin.suggestedSaveFailed)
      return
    }
    setError('')
  }

  return (
    <Backdrop onClick={onClose}>
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="suggestion-editor-title"
        onClick={(event) => event.stopPropagation()}
      >
        <Close type="button" onClick={onClose} aria-label={t.common.cancel}>
          ×
        </Close>
        <Title id="suggestion-editor-title">{fresh ? t.admin.newCatalogEntryTitle : t.admin.suggestedFormTitle}</Title>
        <Lead>
          {fresh
            ? t.admin.newCatalogEntryLead
            : suggestion.origin === 'member'
              ? t.admin.suggestedFormLeadMember
              : `${t.admin.suggestedFormLead} ${t.admin.suggestedBy.replace('{provider}', suggestion.provider)}`}
          {suggestion.scientificName ? ` · ${suggestion.scientificName}` : ''}
        </Lead>
        {suggestion.note ? (
          <Note>
            <strong>{t.admin.suggestedNote}</strong>
            {suggestion.note}
          </Note>
        ) : null}
        <form onSubmit={submit}>
          <FormGrid>
            {variety ? (
              <Section>
                <SectionTitle>{t.admin.suggestedVarietyOf.replace('{category}', variety.name)}</SectionTitle>
              </Section>
            ) : (
              <Section>
                <SectionTitle>{t.admin.suggestedCategory}</SectionTitle>
                <input
                  ref={categoryPhoto}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => readInto(event.target.files?.[0], (photo) => setCategory({ photo }))}
                />
                <PhotoRow type="button" onClick={() => categoryPhoto.current?.click()}>
                  <PhotoPreview>
                    <PlantImage src={draft.category.photo} alt="" />
                  </PhotoPreview>
                  <PhotoCopy>
                    <strong>{t.admin.categoryPhoto}</strong>
                    <small>{t.greenhouse.addPhotoHint}</small>
                  </PhotoCopy>
                </PhotoRow>
                <FormRow>
                  <Field>
                    {t.admin.nameEn}
                    <Input
                      value={draft.category.name}
                      onChange={(event) => setCategory({ name: event.target.value })}
                      required
                    />
                  </Field>
                  <Field>
                    {t.admin.nameHe}
                    <Input value={draft.category.nameHe} onChange={(event) => setCategory({ nameHe: event.target.value })} />
                  </Field>
                  <Field>
                    {t.admin.ticker}
                    <Input
                      value={draft.category.ticker}
                      onChange={(event) => setCategory({ ticker: letters(event.target.value, 6) })}
                      required
                    />
                  </Field>
                </FormRow>
              </Section>
            )}

            <Section>
              <SectionTitle>{t.admin.suggestedSubcategory}</SectionTitle>
              <input
                ref={subcategoryPhoto}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => readInto(event.target.files?.[0], (photo) => setSub({ photo }))}
              />
              <PhotoRow type="button" onClick={() => subcategoryPhoto.current?.click()}>
                <PhotoPreview>
                  <PlantImage src={draft.subcategory.photo} alt="" />
                </PhotoPreview>
                <PhotoCopy>
                  <strong>{t.admin.subcategoryPhoto}</strong>
                  <small>{t.greenhouse.addPhotoHint}</small>
                </PhotoCopy>
              </PhotoRow>
              <FormRow>
                <Field>
                  {t.admin.nameEn}
                  <Input value={draft.subcategory.name} onChange={(event) => setSub({ name: event.target.value })} required />
                </Field>
                <Field>
                  {t.admin.nameHe}
                  <Input
                    value={draft.subcategory.nameHe}
                    onChange={(event) => setSub({ nameHe: event.target.value })}
                  />
                </Field>
                <Field>
                  {t.admin.code}
                  <Input
                    value={draft.subcategory.code}
                    onChange={(event) => setSub({ code: event.target.value.toUpperCase() })}
                    required
                  />
                </Field>
              </FormRow>
            </Section>

            <Section>
              <SectionTitle>{t.admin.properties}</SectionTitle>
              {draft.properties.map((prop, index) => (
                <Card key={index}>
                  <FormRow>
                    <Field>
                      {t.admin.nameEn}
                      <Input value={prop.name} onChange={(event) => setProperty(index, { name: event.target.value })} />
                    </Field>
                    <Field>
                      {t.admin.nameHe}
                      <Input
                        value={prop.nameHe}
                        onChange={(event) => setProperty(index, { nameHe: event.target.value })}
                      />
                    </Field>
                    <Field>
                      {t.admin.suggestedScope}
                      <Select
                        value={prop.scope}
                        onChange={(event) =>
                          setProperty(index, { scope: event.target.value === 'subcategory' ? 'subcategory' : 'category' })
                        }
                      >
                        <option value="category">{t.admin.suggestedScopeCategory}</option>
                        <option value="subcategory">{t.admin.suggestedScopeSubcategory}</option>
                      </Select>
                    </Field>
                  </FormRow>
                  <Check>
                    <input
                      type="checkbox"
                      checked={prop.required}
                      onChange={(event) => setProperty(index, { required: event.target.checked })}
                    />
                    {t.admin.required}
                  </Check>
                  <Check>
                    <input
                      type="checkbox"
                      checked={prop.inMarketName}
                      onChange={(event) =>
                        setProperty(index, {
                          inMarketName: event.target.checked,
                          sign: event.target.checked ? prop.sign : '',
                        })
                      }
                    />
                    {t.admin.inMarketName}
                  </Check>
                  {prop.inMarketName && (
                    <Field>
                      {t.admin.sign}
                      <Input
                        value={prop.sign}
                        maxLength={3}
                        onChange={(event) => setProperty(index, { sign: normalizeSign(event.target.value) })}
                      />
                    </Field>
                  )}
                  {prop.options.map((option, optionIndex) => (
                    <OptionRow key={optionIndex}>
                      <Field>
                        {t.admin.optionName}
                        <Input
                          value={option.label}
                          onChange={(event) => {
                            const options = prop.options.map((item, i) =>
                              i === optionIndex ? { ...item, label: event.target.value } : item,
                            )
                            setProperty(index, { options })
                          }}
                        />
                      </Field>
                      <Field>
                        {t.admin.nameHe}
                        <Input
                          value={option.labelHe}
                          onChange={(event) => {
                            const options = prop.options.map((item, i) =>
                              i === optionIndex ? { ...item, labelHe: event.target.value } : item,
                            )
                            setProperty(index, { options })
                          }}
                        />
                      </Field>
                      <Field>
                        {t.admin.optionSign}
                        <Input
                          value={option.sign}
                          maxLength={3}
                          onChange={(event) => {
                            const options = prop.options.map((item, i) =>
                              i === optionIndex ? { ...item, sign: normalizeSign(event.target.value) } : item,
                            )
                            setProperty(index, { options })
                          }}
                        />
                      </Field>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          setProperty(index, { options: prop.options.filter((_, i) => i !== optionIndex) })
                        }
                      >
                        {t.admin.delete}
                      </Button>
                    </OptionRow>
                  ))}
                  <RowActions>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setProperty(index, { options: [...prop.options, { label: '', labelHe: '', sign: '' }] })
                      }
                    >
                      {t.admin.addOption}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          properties: current.properties.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      {t.admin.removeProperty}
                    </Button>
                  </RowActions>
                </Card>
              ))}
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setDraft((current) => ({ ...current, properties: [...current.properties, emptyProperty()] }))}
              >
                {t.admin.addProperty}
              </Button>
            </Section>

            {error ? <FieldError>{error}</FieldError> : null}
            <Footer>
              <span />
              <div style={{ display: 'flex', gap: 8 }}>
                <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                  {t.common.cancel}
                </Button>
                <Button type="submit" size="sm">
                  {t.admin.suggestedReview}
                </Button>
              </div>
            </Footer>
          </FormGrid>
        </form>
      </Dialog>
    </Backdrop>
  )
}
