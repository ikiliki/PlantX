import { useState } from 'react'
import { GradeChip } from '../../../../components/GradeChip/GradeChip'
import { useI18n } from '../../../../i18n/I18nProvider'
import { formatDay } from '../../chartScale'
import type { ChartTrade } from '../TradeChart/TradeChart'
import {
  ClassCell,
  ClassLink,
  Empty,
  Footer,
  HeadRow,
  MoreButton,
  Muted,
  Parties,
  Price,
  Row,
  Sheet,
} from './TradeTable.styles'

export function TradeTable({ trades, pageSize = 10 }: { trades: ChartTrade[]; pageSize?: number }) {
  const { t, tr, locale, formatMoney } = useI18n()
  const [open, setOpen] = useState(false)
  const shown = open ? trades : trades.slice(0, pageSize)

  return (
    <Sheet>
      <HeadRow>
        <span>{t.charts.date}</span>
        <span>{t.charts.class}</span>
        <span>{t.charts.qty}</span>
        <Price as="span">{t.charts.price}</Price>
        <span>
          {t.charts.seller} → {t.charts.buyer}
        </span>
      </HeadRow>
      {shown.length === 0 && <Empty>{t.charts.noTrades}</Empty>}
      {shown.map((trade) => (
        <Row key={trade.id}>
          <Muted data-col="date">{formatDay(trade.at, locale, 'full')}</Muted>
          <ClassCell>
            <GradeChip grade={trade.quality} />
            <ClassLink to={`/market/${trade.classId}`}>{trade.label}</ClassLink>
          </ClassCell>
          <span data-col="qty">×{trade.qty}</span>
          <Price>{formatMoney(trade.price)}</Price>
          <Parties data-col="parties">
            {tr(trade.seller.en, trade.seller.he)} → {tr(trade.buyer.en, trade.buyer.he)}
          </Parties>
        </Row>
      ))}
      {trades.length > pageSize && (
        <Footer>
          <MoreButton type="button" onClick={() => setOpen((value) => !value)}>
            {open ? t.charts.showLess : `${t.charts.showMore} (${trades.length - pageSize})`}
          </MoreButton>
        </Footer>
      )}
    </Sheet>
  )
}
