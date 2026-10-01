import { useStore } from '../../../../mock/store'
import { isPlacementEnabled, placementRelease } from '../../../../theme/release'
import { Label, MarketValue, Root, Stat, Stats, Value, ValueLabel } from './GreenhouseWallet.styles'

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
  if (!marketOn) return null
  const held = market.status !== 'ready'

  return (
    <Root aria-label={title}>
      <Label>{title}</Label>
      <Stats>
        <Stat>
          <MarketValue
            $held={held}
            data-placement="greenhouse.market.wallet"
            data-feature="market"
            data-feature-mode={market.status}
          >
            <Value $tone="money">{value}</Value>
          </MarketValue>
          <ValueLabel>{valueLabel}</ValueLabel>
        </Stat>
        <Stat>
          <Value $tone="count">{collection}</Value>
          <ValueLabel>{collectionLabel}</ValueLabel>
        </Stat>
      </Stats>
    </Root>
  )
}
