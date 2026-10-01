import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { Plant } from '../../../../mock/types'
import { catalogName } from '../../../catalog/catalog'
import { plantCatalogSource } from '../../plantClass'
import { Label, Root, Thumb } from './CatalogMark.styles'

/** Small catalog icon beside a plant. Info only: it is not one of the plant's photos. */
export function CatalogMark({
  photo,
  name,
  label,
  size = 28,
}: {
  photo?: string
  /** Category or subcategory name. Used as the title and accessible name. */
  name: string
  /** Optional muted caption next to the icon. */
  label?: string
  size?: number
}) {
  if (!photo) return null
  return (
    <Root
      title={name}
      role={label ? undefined : 'img'}
      aria-label={label ? undefined : name}
      data-catalog-mark
    >
      <Thumb $size={size} aria-hidden>
        <PlantImage src={photo} fallbackSrc={photo} alt="" />
      </Thumb>
      {label && <Label>{label}</Label>}
    </Root>
  )
}

/** Derives the catalog icon from the plant's category and subcategory. */
export function PlantCatalogMark({ plant, size }: { plant: Plant; size?: number }) {
  const { db } = useStore()
  const { locale } = useI18n()
  const entry = plantCatalogSource(db.catalog, plant)
  if (!entry) return null
  return <CatalogMark photo={entry.photo} name={catalogName(entry.source, locale)} size={size} />
}
