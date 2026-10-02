import { useI18n } from '../../../../i18n/I18nProvider'
import { Option, Track } from './MarketViewToggle.styles'

function ListIcon() {
  return (
    <svg viewBox="0 0 14 14" aria-hidden>
      <path
        d="M2 3.5h10M2 7h10M2 10.5h10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg viewBox="0 0 14 14" aria-hidden>
      <path
        d="M1.5 3.2 5 2l4 1.4L12.5 2v8.8L9 12 5 10.6 1.5 12V3.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M5 2v8.6M9 3.4V12" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

/** Icon-only list / map switch. Only shown where the page has room for one pane (see MarketSplit). */
export function MarketViewToggle({
  view,
  onChange,
}: {
  view: 'list' | 'map'
  onChange: (view: 'list' | 'map') => void
}) {
  const { t } = useI18n()

  return (
    <Track role="group" aria-label={t.market.viewLabel}>
      <Option
        type="button"
        $on={view === 'list'}
        aria-pressed={view === 'list'}
        onClick={() => onChange('list')}
        aria-label={t.market.viewList}
        title={t.market.viewList}
      >
        <ListIcon />
      </Option>
      <Option
        type="button"
        $on={view === 'map'}
        aria-pressed={view === 'map'}
        onClick={() => onChange('map')}
        aria-label={t.market.viewMap}
        title={t.market.viewMap}
      >
        <MapIcon />
      </Option>
    </Track>
  )
}
