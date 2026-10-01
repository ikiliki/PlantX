import { useStore } from '../../../../mock/store'
import { isPlacementEnabled, placementRelease } from '../../../../theme/release'
import { Label, MarketValue, Root, Value, ValueLabel } from './GreenhouseWallet.styles'

export function GreenhouseWallet({
  title,
  value,
  valueLabel,
  collection,
  collectionLabel,
}: {
  title: string
  value: string
  valueLabel: string
  collection: string
  collectionLabel: string
}) {
  const { db } = useStore()
  const market = placementRelease(db.system, 'greenhouse.market.wallet')
  const marketOn = isPlacementEnabled(db.system, 'greenhouse.market.wallet')

  return (
    <Root aria-label={title}>
      <Label>{title}</Label>
      {marketOn ? (
        <>
          <MarketValue
            $held={market.status !== 'ready'}
            data-placement="greenhouse.market.wallet"
            data-feature="market"
            data-feature-mode={market.status}
          >
            <Value>{value}</Value>
          </MarketValue>
          <ValueLabel>{valueLabel}</ValueLabel>
        </>
      ) : (
        <>
          <Value>{collection}</Value>
          <ValueLabel>{collectionLabel}</ValueLabel>
        </>
      )}
    </Root>
  )
}
