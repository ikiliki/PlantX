import { FormEvent, useEffect, useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import {
  Field,
  FormRow,
  FormSection,
  Select,
  TextArea,
} from '../../../../components/Form/Form'
import { catalogName, optionLabel, propertiesForPlant } from '../../../catalog/catalog'
import { useI18n } from '../../../../i18n/I18nProvider'
import { createCatalog } from '../../../../mock/catalog'
import { AREAS, areaById, greenhousePlace } from '../../../../mock/locations'
import { STAGE_LABEL } from '../../../../mock/marketNaming'
import { useStore } from '../../../../mock/store'
import type { Diagnosis, QualityGrade, SizeBand, StageBand } from '../../../../mock/types'
import {
  emptyClassDraft,
  gradeChoices,
  narrowDraft,
  sizeChoices,
  stageChoices,
  subcategoryChoices,
  catalogChoiceSource,
  synthesizeClass,
  type PlantClassDraft,
} from '../../plantClass'
import { CatalogMark } from '../CatalogMark/CatalogMark'
import { CatalogSelect } from '../CatalogSelect/CatalogSelect'
import { PhotoIdentify } from '../PhotoIdentify/PhotoIdentify'
import { CatalogInfo, ClassCode, Form, Saved, SubmitRow } from './AddPlantForm.styles'

export function AddPlantForm({ onSaved }: { onSaved?: () => void }) {
  const { db, currentUser, signedIn, addGreenhousePlant } = useStore()
  const { t, locale } = useI18n()
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
  const choice = catalogChoiceSource(catalog, draft)
  const catalogPhotoLabel =
    choice && 'categoryId' in choice.source ? t.admin.subcategoryPhoto : t.admin.categoryPhoto
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

  const onDiagnosis = (diagnosis: Diagnosis) => {
    setClass(diagnosis.draft)
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
      <FormSection title={t.greenhouse.formPhoto} hint={t.greenhouse.addPhotoHint}>
        <PhotoIdentify photo={photo} onPhoto={setPhoto} onDiagnosis={onDiagnosis} />
      </FormSection>

      <FormSection title={t.greenhouse.formCatalog} hint={t.greenhouse.formCatalogHint}>
        {choice ? (
          <CatalogInfo>
            <CatalogMark
              photo={choice.photo}
              name={catalogName(choice.source, locale)}
              label={catalogPhotoLabel}
              size={32}
            />
          </CatalogInfo>
        ) : null}
        <FormRow>
          <CatalogSelect
            label={t.admin.category}
            value={draft.categoryId}
            required
            chooseLabel={t.greenhouse.choose}
            options={catalog.categories.map((plant) => ({
              id: plant.id,
              label: catalogName(plant, locale),
            }))}
            onChange={(value) =>
              setClass({
                categoryId: value,
                subcategoryId: '',
                quality: '',
                size: '',
                stage: '',
                traits: {},
              })
            }
          />
          <CatalogSelect
            label={t.admin.subcategory}
            value={draft.subcategoryId}
            required={varieties.length > 0}
            disabled={!draft.categoryId || varieties.length === 0}
            chooseLabel={t.greenhouse.choose}
            options={varieties.map((item) => ({
              id: item.id,
              label: catalogName(item, locale),
            }))}
            onChange={(value) => setClass({ subcategoryId: value, quality: '', size: '', stage: '' })}
          />
        </FormRow>
      </FormSection>

      <FormSection title={t.greenhouse.formRequired} hint={t.greenhouse.formRequiredHint}>
        <FormRow>
          <CatalogSelect
            label={t.admin.grade}
            value={draft.quality}
            required
            disabled={!draft.categoryId || grades.length === 0}
            chooseLabel={t.greenhouse.choose}
            options={grades.map((grade) => ({ id: grade, label: grade }))}
            onChange={(value) => setClass({ quality: value as QualityGrade | '', size: '', stage: '' })}
          />
          <CatalogSelect
            label={t.admin.size}
            value={draft.size}
            required
            disabled={!draft.quality || sizes.length === 0}
            chooseLabel={t.greenhouse.choose}
            options={sizes.map((size) => ({ id: size, label: size }))}
            onChange={(value) => setClass({ size: value as SizeBand | '', stage: '' })}
          />
          <CatalogSelect
            label={t.admin.stage}
            value={draft.stage}
            required
            disabled={!draft.size || stages.length === 0}
            chooseLabel={t.greenhouse.choose}
            options={stages.map((stage) => ({
              id: stage,
              label: STAGE_LABEL[stage as StageBand]?.[locale] ?? stage,
            }))}
            onChange={(value) => setClass({ stage: value as StageBand | '' })}
          />
        </FormRow>
        {requiredExtra.map((property) => (
          <CatalogSelect
            key={property.id}
            label={catalogName(property, locale)}
            value={draft.traits[property.id] ?? ''}
            required
            chooseLabel={t.greenhouse.choose}
            options={property.options.map((option) => ({
              id: option.id,
              label: optionLabel(option, locale),
            }))}
            onChange={(value) => setClass({ traits: { ...draft.traits, [property.id]: value } })}
          />
        ))}
      </FormSection>

      {uniqueProps.length > 0 && (
        <FormSection title={t.greenhouse.moreProperties} hint={t.greenhouse.formOptionalHint}>
          <FormRow>
            {uniqueProps.map((property) => (
              <CatalogSelect
                key={property.id}
                label={catalogName(property, locale)}
                value={draft.traits[property.id] ?? ''}
                chooseLabel={t.greenhouse.choose}
                options={property.options.map((option) => ({
                  id: option.id,
                  label: optionLabel(option, locale),
                }))}
                onChange={(value) =>
                  setClass({
                    traits: {
                      ...draft.traits,
                      [property.id]: value,
                    },
                  })
                }
              />
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
