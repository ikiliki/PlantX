import styled from 'styled-components'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { MarketClass } from '../../../../mock/types'
import { theme } from '../../../../theme/tokens'

const Grid = styled.div`
  display: grid;
  gap: ${theme.space.md};
  @media (min-width: 700px) {
    grid-template-columns: 1fr 1fr;
  }
`

const Col = styled.div`
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  padding: 14px;
  box-shadow: ${theme.shadow.soft};
`

const Title = styled.h3`
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${theme.colors.greenDark};
  margin-bottom: 10px;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid ${theme.colors.border};
  font-size: 13px;
  color: ${theme.colors.ink};
  &:last-child {
    border-bottom: none;
  }
`

const Qty = styled.span`
  color: ${theme.colors.muted};
`

export function OrderBook({ mc }: { mc: MarketClass }) {
  const { t, formatMoney, locale } = useI18n()
  return (
    <Grid>
      <Col>
        <Title>{t.exchange.asks}</Title>
        {mc.asks.map((a, i) => (
          <Row key={i}>
            <span>{locale === 'he' ? a.sellerLabelHe : a.sellerLabel}</span>
            <Qty>×{a.qty}</Qty>
            <strong style={{ color: theme.colors.danger }}>{formatMoney(a.price)}</strong>
          </Row>
        ))}
      </Col>
      <Col>
        <Title>{t.exchange.bids}</Title>
        {mc.bids.map((b, i) => (
          <Row key={i}>
            <span>{locale === 'he' ? b.buyerLabelHe : b.buyerLabel}</span>
            <Qty>×{b.qty}</Qty>
            <strong style={{ color: theme.colors.greenDark }}>{formatMoney(b.price)}</strong>
          </Row>
        ))}
      </Col>
    </Grid>
  )
}
