import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { MarketClass } from '../../../../mock/types'
import { theme } from '../../../../theme/tokens'

const Card = styled(Link)`
  display: grid;
  grid-template-columns: 72px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 14px;
  background: white;
  color: ${theme.colors.ink};
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadow.soft};
  text-decoration: none;
  transition: transform 0.15s ease, border-color 0.15s ease;
  &:hover {
    transform: translateY(-2px);
    border-color: ${theme.colors.green};
  }
`

const Thumb = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 12px;
  overflow: hidden;
`

const Code = styled.div`
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: ${theme.colors.greenDark};
`

const Name = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-top: 2px;
  line-height: 1.3;
`

const Meta = styled.div`
  font-size: 12px;
  color: ${theme.colors.muted};
  margin-top: 4px;
`

const PriceBlock = styled.div`
  text-align: end;
`

const Price = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: ${theme.colors.forest};
`

const Change = styled.div<{ $up: boolean }>`
  font-size: 12px;
  font-weight: 700;
  color: ${({ $up }) => ($up ? theme.colors.greenDark : theme.colors.danger)};
`

export function MarketClassCard({ mc }: { mc: MarketClass }) {
  const { formatMoney, locale, t } = useI18n()
  return (
    <Card to={`/market/${mc.id}`}>
      <Thumb>
        <PlantImage src={mc.photo} alt="" />
      </Thumb>
      <div>
        <Code>{mc.code}</Code>
        <Name>{locale === 'he' ? mc.displayNameHe : mc.displayName}</Name>
        <Meta>
          {t.exchange.supply}: {mc.supplyUnits.toLocaleString()} · {t.exchange.demand}:{' '}
          {mc.demandUnits.toLocaleString()}
        </Meta>
      </div>
      <PriceBlock>
        <Price>{formatMoney(mc.lastPrice)}</Price>
        <Change $up={mc.changePct >= 0}>
          {mc.changePct >= 0 ? '▲' : '▼'} {Math.abs(mc.changePct).toFixed(1)}%
        </Change>
      </PriceBlock>
    </Card>
  )
}
