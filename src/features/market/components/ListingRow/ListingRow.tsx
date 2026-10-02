import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { ListingRowModel } from '../ListingTable/listingRows'
import { Cell, Change, Health, Name, NameCell, Pending, Price, Row, Thumb } from './ListingRow.styles'

function HealthIcon({ health }: { health: string }) {
  if (health === 'D') {
    return (
      <svg viewBox="0 0 16 16" aria-hidden>
        <circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5.5 8h5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    )
  }
  if (health === 'B') {
    return (
      <svg viewBox="0 0 16 16" aria-hidden>
        <circle cx="8" cy="8" r="3.2" fill="currentColor" />
        <path
          d="M8 1.6v1.8M8 12.6v1.8M1.6 8h1.8M12.6 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M12.6 3.4l-1.3 1.3M4.7 11.3l-1.3 1.3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  if (health === 'C') {
    return (
      <svg viewBox="0 0 16 16" aria-hidden>
        <path
          d="M8 13.2c2.6-1.6 4.2-3.4 4.2-5.6a4.2 4.2 0 0 0-8.4 0c0 2.2 1.6 4 4.2 5.6Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M8 4.8v3.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="8" cy="9.6" r="0.7" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 16 16" aria-hidden>
      <path
        d="M8 13.5C8 13.5 2.8 9.6 2.8 6.2a2.7 2.7 0 0 1 4.5-2 2.7 2.7 0 0 1 4.5 2c0 3.4-5.2 7.3-5.2 7.3Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function ListingRow({
  row,
  onOpen,
  selected = false,
  masked = false,
}: {
  row: ListingRowModel
  onOpen?: (id: string) => void
  selected?: boolean
  masked?: boolean
}) {
  const { t } = useI18n()
  const interactive = Boolean(onOpen) && !masked
  return (
    <Row
      type="button"
      $selected={selected}
      $masked={masked}
      $static={!interactive}
      aria-current={selected ? 'true' : undefined}
      aria-disabled={!interactive || undefined}
      tabIndex={interactive ? undefined : -1}
      onClick={() => {
        if (!interactive || !onOpen) return
        onOpen(row.id)
      }}
    >
      <Thumb $stale={row.photoStale}>
        <PlantImage src={row.photo} alt="" />
      </Thumb>
      <NameCell>
        <Name>{row.name}</Name>
        {row.photoStale && (
          <Pending title={t.greenhouse.pendingRefresh} aria-label={t.greenhouse.pendingRefresh}>
            !
          </Pending>
        )}
      </NameCell>
      <Health $health={row.health}>
        <HealthIcon health={row.health} />
        {row.health}
      </Health>
      <Cell>{row.size}</Cell>
      <Cell>{row.stage}</Cell>
      <Cell>{row.area}</Cell>
      <Cell>×{row.qty}</Cell>
      <Price>{row.priceLabel}</Price>
      {row.change == null ? (
        <Cell>—</Cell>
      ) : (
        <Change $up={row.change >= 0}>
          {row.change >= 0 ? '▲' : '▼'} {Math.abs(row.change).toFixed(1)}%
        </Change>
      )}
    </Row>
  )
}
