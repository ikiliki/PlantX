import { useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { ChoiceChips } from '../../../../components/ChoiceChips/ChoiceChips'
import { Field, Input, TextArea } from '../../../../components/Form/Form'
import { ModalDialog } from '../../../../components/ModalDialog/ModalDialog'
import { useI18n } from '../../../../i18n/I18nProvider'
import { createCatalog } from '../../../../mock/catalog'
import { notifyInfo } from '../../../../lib/httpNotice'
import { useStore } from '../../../../mock/store'
import type { Plant, SizeBand, StageBand } from '../../../../mock/types'
import { STAGE_LABEL } from '../../../../mock/marketNaming'
import { emptyClassDraft, sizeChoices, stageChoices } from '../../plantClass'
import { ErrorText } from './PlantEditDialog.styles'

/**
 * Edit a saved plant (#68): the owner, or an admin on anyone's plant. Name, note, size and stage.
 * A field the AI had filled is re-marked kept or changed on the server, so the passport stamps stay true.
 */
export function PlantEditDialog({ plant, onClose }: { plant: Plant; onClose: () => void }) {
  const { t, locale } = useI18n()
  const { db, editPlant } = useStore()
  const catalog = db.catalog ?? createCatalog()
  const [title, setTitle] = useState(locale === 'he' ? plant.titleHe : plant.title)
  const [description, setDescription] = useState(
    (locale === 'he' ? plant.descriptionHe : plant.description) ?? '',
  )
  const [size, setSize] = useState<SizeBand | ''>(plant.sizeBand ?? '')
  const [stage, setStage] = useState<StageBand | ''>(plant.stage ?? '')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const draft = { ...emptyClassDraft, categoryId: plant.speciesId, subcategoryId: plant.subcategoryId ?? '' }
  const sizes = sizeChoices(catalog, draft)
  const stages = stageChoices(catalog, draft)
  const stageLabel = (id: string) => STAGE_LABEL[id as StageBand]?.[locale] ?? id

  const save = async () => {
    if (!title.trim()) return
    setBusy(true)
    setFailed(false)
    const ok = await editPlant(plant.id, {
      title: title.trim(),
      titleHe: title.trim(),
      description: description.trim(),
      descriptionHe: description.trim(),
      ...(size ? { sizeBand: size } : {}),
      ...(stage ? { stage } : {}),
    })
    setBusy(false)
    if (!ok) {
      setFailed(true)
      return
    }
    notifyInfo(t.edit.plantSaved.replace('{name}', title.trim()))
    onClose()
  }

  return (
    <ModalDialog
      title={t.edit.plantTitle}
      lead={t.edit.plantLead}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button type="button" variant="growth" disabled={busy || !title.trim()} onClick={() => void save()}>
            {busy ? t.common.loading : t.common.save}
          </Button>
        </>
      }
    >
      <Field>
        {t.edit.name}
        <Input value={title} maxLength={80} onChange={(event) => setTitle(event.target.value)} required />
      </Field>
      <Field>
        {t.edit.note}
        <TextArea value={description} maxLength={600} onChange={(event) => setDescription(event.target.value)} />
      </Field>
      <ChoiceChips
        label={t.admin.size}
        options={sizes.map((id) => ({ id, label: id }))}
        value={size}
        onChange={(id) => setSize(id as SizeBand)}
      />
      <ChoiceChips
        label={t.admin.stage}
        options={stages.map((id) => ({ id, label: stageLabel(id) }))}
        value={stage}
        onChange={(id) => setStage(id as StageBand)}
      />
      {failed ? <ErrorText role="alert">{t.edit.failed}</ErrorText> : null}
    </ModalDialog>
  )
}
