import { useI18n } from '../../../../i18n/I18nProvider'
import { TickerStrip } from '../MarketTicker/TickerStrip'
import { Label, Strip } from './MarketGlance.styles'

export function MarketGlance({ embedded = false }: { embedded?: boolean }) {
  const { t } = useI18n()

  return (
    <Strip $embedded={embedded}>
      <Label to="/market">{t.nav.market}</Label>
      <TickerStrip variant="glance" />
    </Strip>
  )
}
