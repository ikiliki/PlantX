import { FormEvent, useRef, useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { Field, FormGrid, FormRow, Input } from '../../../../components/Form/Form'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { CarePlan, CatalogSubcategory } from '../../../../mock/types'
import { CarePlanFields } from '../CarePlanFields/CarePlanFields'
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

export type SubcategoryDraft = {
  id?: string
  categoryId: string
  name: string
  nameHe: string
  code: string
  photo?: string
  care?: CarePlan
}

export function SubcategoryEditorDialog({
  categoryId,
  initial,
  inheritedCare,
  onConfirm,
  onDelete,
  onClose,
}: {
  categoryId: string
  initial?: CatalogSubcategory
  /** The category's care plan: what Default means for this variety. */
  inheritedCare?: CarePlan
  onConfirm: (draft: SubcategoryDraft) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const { t } = useI18n()
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(initial?.name ?? '')
  const [nameHe, setNameHe] = useState(initial?.nameHe ?? '')
  const [code, setCode] = useState(initial?.code ?? '')
  const [photo, setPhoto] = useState(initial?.photo ?? '')
  const [care, setCare] = useState<CarePlan | undefined>(initial?.care)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onConfirm({
      id: initial?.id,
      categoryId,
      name,
      nameHe,
      code,
      photo: photo || undefined,
      care,
    })
  }

  return (
    <Backdrop onClick={onClose}>
      <Dialog role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <Close type="button" onClick={onClose} aria-label={t.common.cancel}>
          ×
        </Close>
        <Title>{initial ? t.admin.editSubcategory : t.admin.addSubcategory}</Title>
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
                <strong>{t.admin.subcategoryPhoto}</strong>
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
                {t.admin.code}
                <Input value={code} onChange={(event) => setCode(event.target.value)} required />
              </Field>
            </FormRow>
            <Field as="div">
              {t.admin.careHeading}
              <CarePlanFields value={care} inherited={inheritedCare} onChange={setCare} />
            </Field>
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
