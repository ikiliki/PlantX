import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { SheetGrip, useSheetDrag } from '../../../../components/SheetGrip/SheetGrip'
import { useI18n } from '../../../../i18n/I18nProvider'
import { seasonFor, seasonalCareFor } from '../../../../mock/seasonalCare'
import { useStore } from '../../../../mock/store'
import { catalogPhotos, catalogSpecies } from '../../catalogSpecies'
import { wikiHref } from '../GuideLink/GuideLink'
import {
  Backdrop,
  Choose,
  Close,
  Code,
  Dialog,
  Facts,
  More,
  Name,
  Photo,
  Photos,
  Scientific,
  Scroll,
} from './CatalogPreview.styles'

/**
 * Catalog card for a species, as a popup (a sheet on a phone).
 * `subcategoryId` leads with that variety's photo, name, and code.
 * `action` adds a primary button (Add Plant's Choose) in place of the link to the catalog page.
 */
export function CatalogPreview({
  speciesId,
  subcategoryId,
  action,
  onClose,
}: {
  speciesId: string
  subcategoryId?: string
  action?: { label: string; onClick: () => void }
  onClose: () => void
}) {
  const { db } = useStore()
  const { t, tr } = useI18n()
  const species = catalogSpecies(db, speciesId)
  const variety = subcategoryId ? db.catalog.subcategories.find((item) => item.id === subcategoryId) : undefined
  const photos = [...new Set([variety?.photo, ...catalogPhotos(db, speciesId)].filter((src): src is string => Boolean(src)))]
  const season = seasonalCareFor(speciesId)?.[seasonFor(new Date())]
  const sheet = useSheetDrag(onClose)

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  if (!species) return null

  return createPortal(
    <Backdrop onClick={onClose}>
      <Dialog
        ref={sheet.bind}
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-preview-title"
        onClick={(event) => event.stopPropagation()}
      >
        <SheetGrip label={t.common.dragToClose} {...sheet.grip} />
        <Close type="button" onClick={onClose} aria-label={t.common.cancel}>
          ×
        </Close>
        <Scroll>
          {photos.length > 0 && (
            <Photos>
              {photos.map((src) => (
                <Photo key={src}>
                  <PlantImage src={src} alt="" />
                </Photo>
              ))}
            </Photos>
          )}
          <div>
            <Name id="catalog-preview-title">
              {tr(species.commonName, species.commonNameHe)}
              {variety ? ` · ${tr(variety.name, variety.nameHe)}` : ''}
            </Name>
            {variety?.code ? <Code>{variety.code}</Code> : null}
            {species.scientificName ? (
              <Scientific>
                <em>{species.scientificName}</em>
              </Scientific>
            ) : null}
          </div>
          <Facts>
            {species.growthTime.en ? (
              <div>
                <dt>{t.plant.growthTime}</dt>
                <dd>{tr(species.growthTime.en, species.growthTime.he)}</dd>
              </div>
            ) : null}
            <div>
              <dt>{t.plant.light}</dt>
              <dd>{tr(season?.light ?? species.conditions.light, season?.lightHe ?? species.conditions.lightHe)}</dd>
            </div>
            <div>
              <dt>{t.plant.water}</dt>
              <dd>{tr(season?.water ?? species.conditions.water, season?.waterHe ?? species.conditions.waterHe)}</dd>
            </div>
            {species.conditions.note ? (
              <div>
                <dt>{t.guide.goodToKnow}</dt>
                <dd>{tr(species.conditions.note, species.conditions.noteHe)}</dd>
              </div>
            ) : null}
          </Facts>
          {action ? (
            <Choose type="button" onClick={action.onClick}>
              {action.label}
            </Choose>
          ) : (
            <More to={wikiHref(species.id)} onClick={onClose}>
              {t.guide.openPage}
            </More>
          )}
        </Scroll>
      </Dialog>
    </Backdrop>,
    document.body,
  )
}
