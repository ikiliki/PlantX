import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import type { Plant } from '../../mock/types'
import { toListingRow } from './components/ListingTable/listingRows'

function stageLabelFor(
  labels: { mature: string; established: string; rooted: string; unitCutting: string; unrooted: string },
  stage: string | undefined,
  rooting: Plant['rooting'],
) {
  if (stage === 'MATURE') return labels.mature
  if (stage === 'EST') return labels.established
  if (stage === 'ROOTED') return labels.rooted
  if (stage === 'CUT') return labels.unitCutting
  if (rooting === 'rooted') return labels.rooted
  if (rooting === 'unrooted') return labels.unrooted
  return labels.established
}

export function useOpenMarketListing() {
  const { db } = useStore()
  const { t, locale, formatMoney } = useI18n()
  const navigate = useNavigate()

  return (id: string) => {
    const listing = db.listings.find((item) => item.id === id)
    if (!listing) return
    const plant = db.plants.find((item) => item.id === listing.plantId)
    const marketClass = db.marketClasses.find(
      (item) => item.id === listing.marketClassId || item.id === plant?.marketClassId,
    )
    const species = db.species.find((item) => item.id === plant?.speciesId)
    const row = toListingRow(
      listing,
      plant,
      marketClass,
      locale,
      formatMoney,
      (stage, rooting) => stageLabelFor(t.market, stage, rooting),
      species,
    )
    if (row) navigate(row.href, { state: { listingId: id } })
  }
}
