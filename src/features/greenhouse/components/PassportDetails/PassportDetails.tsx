import { Link } from 'react-router-dom'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { Plant } from '../../../../mock/types'
import { OTHER_CATEGORY_ID } from '../../plantClass'
import { catalogSpecies } from '../../../species/catalogSpecies'
import { useShelves } from '../../useShelves'
import { IdentifyBadge } from '../IdentifyBadge/IdentifyBadge'
import { Grid, Label, Root, Select, Value } from './PassportDetails.styles'

/**
 * Passport → Details: how the plant was identified, its market class, where it came from (lineage), its
 * catalog care, and, for the owner, which shelf it sits on.
 */
export function PassportDetails({ plant, isOwner }: { plant: Plant; isOwner: boolean }) {
  const { t, tr } = useI18n()
  const { db } = useStore()
  const { shelves, shelfOf, placePlant } = useShelves()
  const marketClass = db.marketClasses.find((item) => item.id === plant.marketClassId)
  const parent = plant.parentId ? db.plants.find((item) => item.id === plant.parentId) : undefined
  const species = catalogSpecies(db, plant.speciesId)
  const shelfId = shelfOf(plant.id)

  return (
    <Root data-passport-details>
      <Grid>
        <Label>{t.passport.identifiedBy}</Label>
        <Value>
          <IdentifyBadge identification={plant.identification} notInCatalog={plant.speciesId === OTHER_CATEGORY_ID} />
        </Value>

        {marketClass ? (
          <>
            <Label>{t.passport.marketClass}</Label>
            <Value as="code">{marketClass.code}</Value>
          </>
        ) : null}

        <Label>{t.passport.lineage}</Label>
        <Value>
          {parent ? <Link to={`/plants/${parent.id}`}>{tr(parent.title, parent.titleHe)}</Link> : t.passport.noLineage}
        </Value>

        {species ? (
          <>
            <Label>{t.passport.careLight}</Label>
            <Value>{tr(species.conditions.light, species.conditions.lightHe)}</Value>
            <Label>{t.passport.careWater}</Label>
            <Value>{tr(species.conditions.water, species.conditions.waterHe)}</Value>
          </>
        ) : null}

        {isOwner ? (
          <>
            <Label as="label" htmlFor={`passport-shelf-${plant.id}`}>
              {t.greenhouse.shelfLabel}
            </Label>
            <Value>
              <Select
                id={`passport-shelf-${plant.id}`}
                value={shelfId ?? ''}
                onChange={(event) => void placePlant(plant.id, event.target.value || null)}
                data-passport-shelf
              >
                <option value="">{t.greenhouse.shelfNone}</option>
                {shelves.map((shelf) => (
                  <option key={shelf.id} value={shelf.id}>
                    {shelf.name}
                  </option>
                ))}
              </Select>
            </Value>
          </>
        ) : null}
      </Grid>
    </Root>
  )
}
