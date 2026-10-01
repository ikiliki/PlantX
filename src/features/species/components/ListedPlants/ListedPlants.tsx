import { SectionHeading } from '../../../../components/SectionHeading/SectionHeading'
import { ListingCard } from '../../../market/components/ListingCard/ListingCard'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { Empty, Grid, Root } from './ListedPlants.styles'

const LISTED_LIMIT = 6

export function ListedPlants({
  speciesId,
  marketHref,
  bare,
}: {
  speciesId: string
  marketHref?: string
  bare?: boolean
}) {
  const { db } = useStore()
  const { t } = useI18n()
  const listings = db.listings.filter((listing) => {
    if (listing.status !== 'active') return false
    const plant = db.plants.find((item) => item.id === listing.plantId)
    return plant?.speciesId === speciesId
  })

  return (
    <Root aria-label={t.guide.listed}>
      {!bare && (
        <SectionHeading title={t.guide.listed} actionLabel={marketHref ? t.guide.viewMarket : undefined} actionTo={marketHref} />
      )}
      {listings.length === 0 ? (
        <Empty>{t.guide.listedEmpty}</Empty>
      ) : (
        <Grid>
          {listings.slice(0, LISTED_LIMIT).map((listing) => (
            <ListingCard key={listing.id} listing={listing} compact />
          ))}
        </Grid>
      )}
    </Root>
  )
}
