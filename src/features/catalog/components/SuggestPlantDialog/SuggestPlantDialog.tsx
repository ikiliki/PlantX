import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../../../../components/Button/Button'
import { ChoiceChips } from '../../../../components/ChoiceChips/ChoiceChips'
import { Field, Input, TextArea } from '../../../../components/Form/Form'
import { Segmented } from '../../../../components/Segmented/Segmented'
import { useI18n } from '../../../../i18n/I18nProvider'
import { notifyInfo } from '../../../../lib/httpNotice'
import { readPhoto, UnreadablePhotoError } from '../../../../lib/readPhoto'
import type { Catalog, CatalogSuggestionInput } from '../../../../mock/types'
import { wikiHref } from '../../../species/components/GuideLink/GuideLink'
import { SUGGEST_NAME_MAX, SUGGEST_NOTE_MAX, SUGGEST_OPEN_LIMIT, emptySuggestionInput, existingEntry } from '../../catalogSuggest'
import type { SuggestResult } from '../../useCatalogSuggestions'
import {
  Actions,
  Backdrop,
  Close,
  Done,
  DoneMark,
  Problem,
  ExistsLink,
  Form,
  Frame,
  Head,
  Optional,
  PhotoDrop,
  PhotoPreview,
  PhotoText,
} from './SuggestPlantDialog.styles'

type Kind = 'new' | 'variety'

/** The Catalog's "Suggest a plant" form. A sent suggestion shows as pending in the member's catalog. */
export function SuggestPlantDialog({
  catalog,
  onSubmit,
  onClose,
  initial,
}: {
  catalog: Catalog
  onSubmit: (input: CatalogSuggestionInput) => Promise<SuggestResult>
  onClose: () => void
  /** Prefilled from an Add Plant scan the catalog lacks (#64). */
  initial?: Partial<CatalogSuggestionInput>
}) {
  const { t, locale } = useI18n()
  const fileRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const [kind, setKind] = useState<Kind>('new')
  const [input, setInput] = useState<CatalogSuggestionInput>({ ...emptySuggestionInput, ...initial })
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState<Exclude<SuggestResult, { ok: true }>['problem'] | null>(null)
  const [sent, setSent] = useState<string | null>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  // Once per open: lock the page, close on Escape, start on the name.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopImmediatePropagation()
      closeRef.current()
    }
    window.addEventListener('keydown', onKey, true)
    nameRef.current?.focus()
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey, true)
    }
  }, [])

  const set = (patch: Partial<CatalogSuggestionInput>) => {
    setInput((current) => ({ ...current, ...patch }))
    setProblem(null)
  }

  const categories = useMemo(
    () =>
      catalog.categories.map((item) => ({
        id: item.id,
        label: locale === 'he' && item.nameHe ? item.nameHe : item.name,
        photo: item.photo,
      })),
    [catalog.categories, locale],
  )
  const found = existingEntry(catalog, input)
  const shownProblem = problem ?? (found ? 'exists' : null)
  const message =
    shownProblem === 'name'
      ? t.suggest.errorName
      : shownProblem === 'category'
        ? t.suggest.errorCategory
        : shownProblem === 'exists'
          ? t.suggest.errorExists.replace('{name}', input.name.trim())
          : shownProblem === 'photo'
            ? t.suggest.errorPhoto
            : shownProblem === 'note'
              ? t.suggest.errorNote
              : shownProblem === 'limit'
                ? t.suggest.errorLimit.replace('{count}', String(SUGGEST_OPEN_LIMIT))
                : shownProblem === 'failed'
                  ? t.suggest.errorFailed
                  : ''

  const pickKind = (next: Kind) => {
    setKind(next)
    set({ categoryId: '' })
  }

  const pickPhoto = (file: File | undefined) => {
    if (!file) return
    void readPhoto(file).then(
      (photo) => set({ photo }),
      (error: unknown) =>
        notifyInfo(
          t.addPlant.unreadableTitle,
          t.addPlant.unreadableBody.replace('{format}', error instanceof UnreadablePhotoError ? error.format : '?'),
        ),
    )
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    if (kind === 'variety' && !input.categoryId) {
      setProblem('category')
      return
    }
    setBusy(true)
    const result = await onSubmit(input)
    setBusy(false)
    if (result.ok) setSent(result.suggestion.name)
    else setProblem(result.problem)
  }

  return createPortal(
    <Backdrop onClick={onClose}>
      <Frame
        role="dialog"
        aria-modal="true"
        aria-labelledby="suggest-plant-title"
        onClick={(event) => event.stopPropagation()}
      >
        <Close type="button" onClick={onClose} aria-label={t.common.cancel}>
          ×
        </Close>
        {sent ? (
          <Done role="status">
            <DoneMark aria-hidden>✓</DoneMark>
            <h2 id="suggest-plant-title">{t.suggest.doneTitle}</h2>
            <p>{t.suggest.doneBody.replace('{name}', sent)}</p>
            <Button type="button" onClick={onClose}>
              {t.suggest.done}
            </Button>
          </Done>
        ) : (
          <Form onSubmit={(event) => void submit(event)} noValidate>
            <Head>
              <h2 id="suggest-plant-title">{t.suggest.title}</h2>
              <p>{t.suggest.lead}</p>
            </Head>

            <Field as="div">
              {t.suggest.kindLabel}
              <Segmented<Kind>
                ariaLabel={t.suggest.kindLabel}
                value={kind}
                onChange={pickKind}
                options={[
                  { id: 'new', label: t.suggest.kindNew },
                  { id: 'variety', label: t.suggest.kindVariety },
                ]}
              />
            </Field>

            {kind === 'variety' ? (
              <ChoiceChips
                label={t.suggest.categoryLabel}
                options={categories}
                value={input.categoryId}
                onChange={(categoryId) => set({ categoryId })}
                required
                scroll
                missing={shownProblem === 'category' ? t.suggest.errorCategory : undefined}
              />
            ) : null}

            <Field>
              {kind === 'variety' ? t.suggest.varietyName : t.suggest.name}
              <Input
                ref={nameRef}
                value={input.name}
                maxLength={SUGGEST_NAME_MAX}
                placeholder={kind === 'variety' ? t.suggest.varietyPlaceholder : t.suggest.namePlaceholder}
                aria-invalid={shownProblem === 'name' || shownProblem === 'exists'}
                onChange={(event) => set({ name: event.target.value })}
              />
            </Field>

            <Field>
              <span>
                {t.suggest.scientific} <Optional>({t.suggest.optional})</Optional>
              </span>
              <Input
                value={input.scientificName}
                maxLength={SUGGEST_NAME_MAX}
                placeholder={t.suggest.scientificPlaceholder}
                dir="ltr"
                onChange={(event) => set({ scientificName: event.target.value })}
              />
            </Field>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => {
                pickPhoto(event.target.files?.[0])
                event.target.value = ''
              }}
            />
            <PhotoDrop type="button" $filled={Boolean(input.photo)} onClick={() => fileRef.current?.click()}>
              <PhotoPreview>{input.photo ? <img src={input.photo} alt="" /> : <span aria-hidden>＋</span>}</PhotoPreview>
              <PhotoText>
                <strong>{input.photo ? t.suggest.photoChange : t.suggest.photo}</strong>
                <small>{t.suggest.photoHint}</small>
              </PhotoText>
            </PhotoDrop>
            {input.photo ? (
              <Button type="button" size="sm" variant="ghost" onClick={() => set({ photo: '' })}>
                {t.suggest.photoRemove}
              </Button>
            ) : null}

            <Field>
              <span>
                {t.suggest.note} <Optional>({t.suggest.optional})</Optional>
              </span>
              <TextArea
                value={input.note}
                maxLength={SUGGEST_NOTE_MAX}
                placeholder={t.suggest.notePlaceholder}
                onChange={(event) => set({ note: event.target.value })}
              />
            </Field>

            {message ? (
              <Problem role="alert">
                {message}
                {shownProblem === 'exists' && found?.speciesId ? (
                  <>
                    {' '}
                    <ExistsLink to={wikiHref(found.speciesId)} onClick={onClose}>
                      {t.suggest.errorExistsLink}
                    </ExistsLink>
                  </>
                ) : null}
              </Problem>
            ) : null}

            <Actions>
              <Button type="button" variant="ghost" onClick={onClose}>
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={busy || shownProblem === 'exists'}>
                {busy ? t.suggest.sending : t.suggest.send}
              </Button>
            </Actions>
          </Form>
        )}
      </Frame>
    </Backdrop>,
    document.body,
  )
}
