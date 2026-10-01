import { Link } from 'react-router-dom'
import { Badge } from '../../../../components/Badge/Badge'
import { Card, CardBody, CardMedia } from '../../../../components/Card/Card'
import { GradeChip } from '../../../../components/GradeChip/GradeChip'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { Listing } from '../../../../mock/types'
import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

const Price = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: ${theme.colors.forest};
`

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  font-size: 13px;
  color: ${theme.colors.muted};
`

const Media = styled(CardMedia)<{ $compact?: boolean }>`
  aspect-ratio: ${({ $compact }) => ($compact ? '16 / 10' : '4 / 3')};
  max-height: ${({ $compact }) => ($compact ? '188px' : 'none')};
`

const Overlay = styled.div`
  position: absolute;
  top: 10px;
  inset-inline-start: 10px;
  display: flex;
  gap: 6px;
`

export function ListingCard({ listing, compact = false }: { listing: Listing; compact?: boolean }) {
  const { db } = useStore()
  const { t, tr, formatMoney, locale } = useI18n()
  const plant = db.plants.find((p) => p.id === listing.plantId)
  const seller = db.users.find((u) => u.id === listing.sellerId)
  const marketClass = db.marketClasses.find(
    (m) => m.id === listing.marketClassId || m.id === plant?.marketClassId,
  )
  if (!plant) return null

  return (
    <Link to={marketClass ? `/market/${marketClass.id}` : `/plants/${plant.id}`}>
      <Card $pad={false} $clickable>
        <Media $compact={compact}>
          <PlantImage src={plant.photos[0]} alt="" />
          <Overlay>
            {marketClass && <Badge $tone="lime">{marketClass.code}</Badge>}
            {plant.verifiedAt && <Badge $tone="forest">{t.market.verified}</Badge>}
            {listing.unit === 'bundle' && <Badge $tone="forest">{t.market.bundle}</Badge>}
            {listing.status !== 'active' && (
              <Badge $tone="warn">{listing.status}</Badge>
            )}
          </Overlay>
        </Media>
        <CardBody>
          <strong>
            {marketClass
              ? locale === 'he'
                ? marketClass.displayNameHe
                : marketClass.displayName
              : tr(plant.title, plant.titleHe)}
          </strong>
          <Meta>
            <span>{plant.code}</span>
            <GradeChip grade={plant.quality} />
            <span>
              {plant.rooting === 'rooted'
                ? t.market.rooted
                : plant.rooting === 'unrooted'
                  ? t.market.unrooted
                  : plant.rooting}
            </span>
          </Meta>
          <Meta>
            <span>×{listing.quantity}</span>
            <span>·</span>
            <span>{locale === 'he' ? listing.regionHe : listing.region}</span>
            {seller && (
              <>
                <span>·</span>
                <span>★ {seller.rating}</span>
              </>
            )}
          </Meta>
          <Price>
            {formatMoney(marketClass?.lastPrice ?? listing.price)}
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.colors.muted }}>
              {' '}
              / {listing.unit}
            </span>
            {marketClass && (
              <span
                style={{
                  marginInlineStart: 8,
                  fontSize: 13,
                  color: marketClass.changePct >= 0 ? theme.colors.greenDark : theme.colors.danger,
                }}
              >
                {marketClass.changePct >= 0 ? '▲' : '▼'} {Math.abs(marketClass.changePct).toFixed(1)}%
              </span>
            )}
          </Price>
        </CardBody>
      </Card>
    </Link>
  )
}
