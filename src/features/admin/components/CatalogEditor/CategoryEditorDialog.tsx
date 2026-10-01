import { FormEvent, useRef, useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { Field, FormGrid, FormRow, Input } from '../../../../components/Form/Form'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { defaultPlantPhoto } from '../../../../mock/images'
import type { CatalogCategory } from '../../../../mock/types'
import { readPhotoFile } from '../../../../utils/readPhoto'
import {
  Backdrop,
  Close,
  Dialog,
  Footer,
  PhotoCopy,
  PhotoPreview,
  PhotoRow,
  Title,
} from './CatalogEditorDialog.styles'

export type CategoryDraft = {
  id?: string
  name: string
  nameHe: string
  ticker: string
  photo: string
}

export function CategoryEditorDialog({
  initial,
  onConfirm,
  onDelete,
  onClose,
}: {
  initial?: Partial<Pick<CatalogCategory, 'id' | 'name' | 'nameHe' | 'ticker' | 'photo'>>
  onConfirm: (draft: CategoryDraft) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const { t } = useI18n()
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(initial?.name ?? '')
  const [nameHe, setNameHe] = useState(initial?.nameHe ?? '')
  const [ticker, setTicker] = useState(initial?.ticker ?? '')
  const [photo, setPhoto] = useState(initial?.photo ?? defaultPlantPhoto)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onConfirm({ id: initial?.id, name, nameHe, ticker, photo })
  }

  return (
    <Backdrop onClick={onClose}>
      <Dialog role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <Close type="button" onClick={onClose} aria-label={t.common.cancel}>
          ×
        </Close>
        <Title>{initial?.id ? t.admin.editCategory : t.admin.addCategory}</Title>
        <form onSubmit={submit}>
          <FormGrid>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                void readPhotoFile(file).then(setPhoto)
              }}
            />
            <PhotoRow type="button" onClick={() => fileRef.current?.click()}>
              <PhotoPreview>{photo && <PlantImage src={photo} alt="" />}</PhotoPreview>
              <PhotoCopy>
                <strong>{t.admin.categoryPhoto}</strong>
                <small>{t.greenhouse.addPhotoHint}</small>
              </PhotoCopy>
            </PhotoRow>
            <FormRow>
              <Field>
                {t.admin.nameEn}
                <Input value={name} onChange={(event) => setName(event.target.value)} required />
              </Field>
              <Field>
                {t.admin.nameHe}
                <Input value={nameHe} onChange={(event) => setNameHe(event.target.value)} />
              </Field>
              <Field>
                {t.admin.ticker}
                <Input value={ticker} onChange={(event) => setTicker(event.target.value)} required />
              </Field>
            </FormRow>
            <Footer>
              {initial && onDelete ? (
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
