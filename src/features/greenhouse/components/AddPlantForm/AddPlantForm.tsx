import { FormEvent, useEffect, useRef, useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import {
  Field,
  FormRow,
  FormSection,
  Select,
  TextArea,
} from '../../../../components/Form/Form'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { catalogName, optionLabel, propertiesForPlant } from '../../../catalog/catalog'
import { useI18n } from '../../../../i18n/I18nProvider'
import { createCatalog } from '../../../../mock/catalog'
import { AREAS, areaById, greenhousePlace } from '../../../../mock/locations'
import { STAGE_LABEL } from '../../../../mock/marketNaming'
import { useStore } from '../../../../mock/store'
import type { QualityGrade, SizeBand, StageBand } from '../../../../mock/types'
import {
  emptyClassDraft,
  gradeChoices,
  narrowDraft,
  sizeChoices,
  stageChoices,
  subcategoryChoices,
  catalogChoicePhoto,
  synthesizeClass,
  type PlantClassDraft,
} from '../../plantClass'
import {
  CatalogMark,
  ClassCode,
  Form,
  PhotoButton,
  PhotoCopy,
  Preview,
  Saved,
  SubmitRow,
} from './AddPlantForm.styles'

function readPhoto(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        const max = 900
        const scale = Math.min(1, max / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(image.width * scale)
        canvas.height = Math.round(image.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(String(reader.result))
          return
        }
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.72))
      }
      image.onerror = () => resolve(String(reader.result))
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

export function AddPlantForm({ onSaved }: { onSaved?: () => void }) {
  const { db, currentUser, signedIn, addGreenhousePlant } = useStore()
  const { t, locale } = useI18n()
  const fileRef = useRef<HTMLInputElement>(null)
  const ownerId = signedIn && currentUser ? currentUser.id : db.visitorId
  const home = greenhousePlace({ user: currentUser, signedIn, ownerId, plants: db.plants })
  const defaultAreaId = AREAS.find((area) => area.region === home?.region)?.id ?? ''
  const catalog = db.catalog ?? createCatalog()
  const [draft, setDraft] = useState<PlantClassDraft>(emptyClassDraft)
  const [photo, setPhoto] = useState('')
  const [description, setDescription] = useState('')
  const [descriptionTouched, setDescriptionTouched] = useState(false)
  const [areaId, setAreaId] = useState(defaultAreaId)
  const [saved, setSaved] = useState(false)

  const matched = synthesizeClass(catalog, draft)
  const choicePhoto = catalogChoicePhoto(catalog, draft)
  const selectedSub = catalog.subcategories.find((item) => item.id === draft.subcategoryId)
  const catalogPhotoLabel = selectedSub?.photo ? t.admin.subcategoryPhoto : t.admin.categoryPhoto
  const varieties = subcategoryChoices(catalog, draft)
  const grades = gradeChoices(catalog, draft)
  const sizes = sizeChoices(catalog, draft)
  const stages = stageChoices(catalog, draft)
  const requiredExtra = propertiesForPlant(catalog, draft.categoryId, draft.subcategoryId, true).filter(
    (item) => item.id !== 'grade' && item.id !== 'size' && item.id !== 'stage',
  )
  const uniqueProps = propertiesForPlant(catalog, draft.categoryId, draft.subcategoryId, false)

  useEffect(() => {
    if (!matched || descriptionTouched) return
    setDescription(locale === 'he' ? matched.observedHe : matched.observed)
  }, [matched, locale, descriptionTouched])

  const setClass = (partial: Partial<PlantClassDraft>) => {
    setDraft((current) => narrowDraft(catalog, { ...current, ...partial }))
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const area = areaById(areaId)
    if (!matched || !area || !description.trim()) return
    const category = catalog.categories.find((item) => item.id === draft.categoryId)
    const species = db.species.find((item) => item.id === category?.speciesId)
    const sub = catalog.subcategories.find((item) => item.id === draft.subcategoryId)
    if (!category || !species || !draft.quality || !draft.size || !draft.stage) return
    const id = addGreenhousePlant({
      title: matched.name,
      titleHe: matched.nameHe,
      description: descriptionTouched ? description : matched.observed,
      descriptionHe: descriptionTouched ? description : matched.observedHe,
      photo: photo || undefined,
      catalogPhoto: choicePhoto || undefined,
      speciesId: species.id,
      variety: sub?.name ?? category.name,
      varietyHe: sub?.nameHe ?? category.nameHe,
      quality: draft.quality,
      sizeBand: draft.size,
      stage: draft.stage,
      code: matched.code,
      marketClassId: db.marketClasses.find((item) => item.code === matched.code)?.id,
      subcategoryId: draft.subcategoryId || undefined,
      traits: draft.traits,
      location: { region: area.region, regionHe: area.regionHe, lat: area.lat, lng: area.lng },
    })
    if (!id) return
    setDraft(emptyClassDraft)
    setPhoto('')
    setDescription('')
    setDescriptionTouched(false)
    setAreaId(defaultAreaId)
    if (onSaved) onSaved()
    else setSaved(true)
  }

  const canSave =
    Boolean(matched && areaId && description.trim() && draft.quality && draft.size && draft.stage && draft.categoryId) &&
    requiredExtra.every((item) => draft.traits[item.id])

  return (
    <Form onSubmit={onSubmit}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (!file) return
          void readPhoto(file).then(setPhoto)
        }}
      />

      <FormSection title={t.greenhouse.formPhoto} hint={t.greenhouse.addPhotoHint}>
        <PhotoButton type="button" onClick={() => fileRef.current?.click()}>
          <Preview>
            {photo ? <PlantImage src={photo} fallbackSrc={photo} alt="" /> : null}
          </Preview>
          <PhotoCopy>
            <strong>{t.greenhouse.addPhoto}</strong>
            <small>{t.greenhouse.addClassNote}</small>
          </PhotoCopy>
        </PhotoButton>
      </FormSection>

      <FormSection title={t.greenhouse.formCatalog} hint={t.greenhouse.formCatalogHint}>
        {choicePhoto ? (
          <CatalogMark>
            <Preview>
              <PlantImage src={choicePhoto} fallbackSrc={choicePhoto} alt="" />
            </Preview>
            <PhotoCopy>
              <strong>{catalogPhotoLabel}</strong>
            </PhotoCopy>
          </CatalogMark>
        ) : null}
        <FormRow>
          <Field>
            {t.admin.category}
            <Select
              value={draft.categoryId}
              required
              aria-label={t.admin.category}
              onChange={(event) =>
                setClass({ categoryId: event.target.value, subcategoryId: '', quality: '', size: '', stage: '', traits: {} })
              }
            >
              <option value="">{t.greenhouse.choose}</option>
              {catalog.categories.map((plant) => (
                <option key={plant.id} value={plant.id}>
                  {catalogName(plant, locale)}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            {t.admin.subcategory}
            <Select
              value={draft.subcategoryId}
              required={varieties.length > 0}
              disabled={!draft.categoryId || varieties.length === 0}
              aria-label={t.admin.subcategory}
              onChange={(event) => setClass({ subcategoryId: event.target.value, quality: '', size: '', stage: '' })}
            >
              <option value="">{t.greenhouse.choose}</option>
              {varieties.map((item) => (
                <option key={item.id} value={item.id}>
                  {catalogName(item, locale)}
                </option>
              ))}
            </Select>
          </Field>
        </FormRow>
      </FormSection>

      <FormSection title={t.greenhouse.formRequired} hint={t.greenhouse.formRequiredHint}>
        <FormRow>
          <Field>
            {t.admin.grade}
            <Select
              value={draft.quality}
              required
              disabled={!draft.categoryId || grades.length === 0}
              aria-label={t.admin.grade}
              onChange={(event) => setClass({ quality: event.target.value as QualityGrade | '', size: '', stage: '' })}
            >
              <option value="">{t.greenhouse.choose}</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            {t.admin.size}
            <Select
              value={draft.size}
              required
              disabled={!draft.quality || sizes.length === 0}
              aria-label={t.admin.size}
              onChange={(event) => setClass({ size: event.target.value as SizeBand | '', stage: '' })}
            >
              <option value="">{t.greenhouse.choose}</option>
              {sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            {t.admin.stage}
            <Select
              value={draft.stage}
              required
              disabled={!draft.size || stages.length === 0}
              aria-label={t.admin.stage}
              onChange={(event) => setClass({ stage: event.target.value as StageBand | '' })}
            >
              <option value="">{t.greenhouse.choose}</option>
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {STAGE_LABEL[stage as StageBand]?.[locale] ?? stage}
                </option>
              ))}
            </Select>
          </Field>
        </FormRow>
        {requiredExtra.map((property) => (
          <Field key={property.id}>
            {catalogName(property, locale)}
            <Select
              value={draft.traits[property.id] ?? ''}
              required
              aria-label={catalogName(property, locale)}
              onChange={(event) =>
                setClass({ traits: { ...draft.traits, [property.id]: event.target.value } })
              }
            >
              <option value="">{t.greenhouse.choose}</option>
              {property.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {optionLabel(option, locale)}
                </option>
              ))}
            </Select>
          </Field>
        ))}
      </FormSection>

      {uniqueProps.length > 0 && (
        <FormSection title={t.greenhouse.moreProperties} hint={t.greenhouse.formOptionalHint}>
          <FormRow>
            {uniqueProps.map((property) => (
              <Field key={property.id}>
                {catalogName(property, locale)}
                <Select
                  value={draft.traits[property.id] ?? ''}
                  aria-label={catalogName(property, locale)}
                  onChange={(event) =>
                    setClass({
                      traits: {
                        ...draft.traits,
                        [property.id]: event.target.value,
                      },
                    })
                  }
                >
                  <option value="">{t.greenhouse.choose}</option>
                  {property.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {optionLabel(option, locale)}
                    </option>
                  ))}
                </Select>
              </Field>
            ))}
          </FormRow>
        </FormSection>
      )}

      <FormSection title={t.greenhouse.formDetails}>
        {matched && <ClassCode>{matched.code}</ClassCode>}
        <Field>
          {t.greenhouse.addDescription}
          <TextArea
            value={description}
            required
            disabled={!matched}
            onChange={(event) => {
              setDescriptionTouched(true)
              setDescription(event.target.value)
            }}
          />
        </Field>
        <Field>
          {t.greenhouse.addLocation}
          <Select
            value={areaId}
            required
            aria-label={t.greenhouse.addLocation}
            onChange={(event) => setAreaId(event.target.value)}
          >
            <option value="">{t.greenhouse.locationPlaceholder}</option>
            {AREAS.map((area) => (
              <option key={area.id} value={area.id}>
                {locale === 'he' ? area.regionHe : area.region}
              </option>
            ))}
          </Select>
        </Field>
        <SubmitRow>
          <Button type="submit" disabled={!canSave}>
            {t.greenhouse.savePlant}
          </Button>
          {saved && <Saved>{t.greenhouse.savedLocal}</Saved>}
        </SubmitRow>
      </FormSection>
    </Form>
  )
}
