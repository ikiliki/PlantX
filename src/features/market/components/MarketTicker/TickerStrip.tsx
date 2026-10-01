import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { TickerQuote, TickerSlot } from '../../tickerTape'
import { maskedChange, maskedPrice } from '../../maskedQuote'
import { incomingQuote, useTickerTape } from '../../useTickerTape'
import {
  Code,
  Copy,
  EmptySlot,
  HeldItem,
  Item,
  Price,
  Quiet,
  Tape,
  Thumb,
  Track,
} from './MarketTicker.styles'

type Variant = 'bar' | 'glance'

function priceDirection(changePct: number | null) {
  if (changePct == null) return 'flat' as const
  return changePct >= 0 ? ('up' as const) : ('down' as const)
}

function priceLabel(quote: TickerQuote, formatMoney: (value: number) => string) {
  const money = formatMoney(quote.price)
  if (quote.changePct == null) return money
  const arrow = quote.changePct >= 0 ? '▲' : '▼'
  return `${money} ${arrow} ${Math.abs(quote.changePct).toFixed(1)}%`
}

export function TickerStrip({ variant, prices = 'live' }: { variant: Variant; prices?: 'live' | 'masked' }) {
  const { db } = useStore()
  const { t, formatMoney } = useI18n()
  const { stock, slots, cursor, run, cycling, step } = useTickerTape(db, db.flags.marketBanner)
  const empty = slots.every((slot) => slot.kind === 'empty')
  const visibleQuotes = slots.filter((slot) => slot.kind === 'quote').length
  const buffer = cycling ? incomingQuote(stock, cursor, visibleQuotes) : undefined
  const motion = empty ? 'still' : cycling ? 'step' : run ? 'pan' : 'still'

  const renderSlot = (slot: TickerSlot, bufferSlot = false) => {
    if (slot.kind === 'empty') {
      return (
        <EmptySlot
          key={slot.key}
          $variant={variant}
          role="listitem"
          aria-label={t.market.tickerEmpty}
          data-ticker-slot="empty"
        >
          <Thumb $variant={variant} $quiet aria-hidden />
          <Copy>
            <Quiet $variant={variant} aria-hidden>
              —
            </Quiet>
            <Quiet $variant={variant} aria-hidden>
              —
            </Quiet>
          </Copy>
        </EmptySlot>
      )
    }

    const { quote } = slot
    const body = (
      <>
        <Thumb $variant={variant}>
          <PlantImage src={quote.photo} alt="" />
        </Thumb>
        <Copy>
          <Code $variant={variant}>{quote.code}</Code>
          {prices === 'masked' ? (
            <Price $variant={variant} $dir={priceDirection(maskedChange(quote.id))}>
              {priceLabel(
                { ...quote, price: maskedPrice(quote.id), changePct: maskedChange(quote.id) },
                formatMoney,
              )}
            </Price>
          ) : (
            <Price $variant={variant} $dir={priceDirection(quote.changePct)}>
              {priceLabel(quote, formatMoney)}
            </Price>
          )}
        </Copy>
      </>
    )

    if (prices === 'masked') {
      return (
        <HeldItem
          key={slot.key}
          $variant={variant}
          role="listitem"
          data-ticker-slot="quote"
          data-ticker-code={quote.code}
          aria-hidden={bufferSlot ? true : undefined}
        >
          {body}
        </HeldItem>
      )
    }

    return (
      <Item
        key={slot.key}
        to={quote.href}
        $variant={variant}
        data-ticker-slot="quote"
        data-ticker-code={quote.code}
        data-ticker-buffer={bufferSlot ? '' : undefined}
        tabIndex={bufferSlot ? -1 : undefined}
        aria-hidden={bufferSlot ? true : undefined}
      >
        {body}
      </Item>
    )
  }

  return (
    <Tape
      $variant={variant}
      role="region"
      aria-label={t.market.tickerLabel}
      data-ticker-stock={stock.length}
      data-ticker-slots={slots.length}
    >
      <Track
        role="list"
        $motion={motion}
        $fill={empty}
        $min={variant === 'bar' ? '232px' : '180px'}
        onAnimationIteration={cycling ? step : undefined}
      >
        {slots.map((slot) => renderSlot(slot))}
        {buffer
          ? renderSlot({ kind: 'quote', key: 'slot-buffer', quote: buffer }, true)
          : null}
      </Track>
    </Tape>
  )
}
