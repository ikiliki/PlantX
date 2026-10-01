import { useState, type ReactNode } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { SEASONS, seasonFor, type Season, type SeasonalCareMap } from '../../mock/seasonalCare'
import { Icon } from '../Icon/Icon'
import { Divider, Drops, Footer, Label, Root, Row, Rows, SeasonTab, Tabs, Text, Title } from './SeasonalCare.styles'

const SEASON_MARK: Record<Season, string> = {
  spring: '🌱',
  summer: '🌞',
  autumn: '🍂',
  winter: '❄️',
}

type Props = {
  care: SeasonalCareMap
  /** Extra lines under the season rows, e.g. growth time or a note about this specimen. */
  footer?: ReactNode
  initialSeason?: Season
  hideHeading?: boolean
}

export function SeasonalCare({ care, footer, initialSeason, hideHeading }: Props) {
  const { t, tr } = useI18n()
  const [season, setSeason] = useState<Season>(() => initialSeason ?? seasonFor(new Date()))
  const current = care[season]

  return (
    <Root aria-labelledby={hideHeading ? undefined : 'seasonal-care-title'}>
      {!hideHeading && <Title id="seasonal-care-title">{t.plant.seasonalCare}</Title>}
      <Tabs role="tablist" aria-label={t.plant.seasonalCare}>
        {SEASONS.map((id) => (
          <SeasonTab
            key={id}
            type="button"
            role="tab"
            aria-selected={season === id}
            $on={season === id}
            onClick={() => setSeason(id)}
          >
            <span aria-hidden>{SEASON_MARK[id]}</span>
            {t.plant.seasons[id]}
          </SeasonTab>
        ))}
      </Tabs>
      <Divider />
      <Rows key={season} role="tabpanel">
        <Row>
          <Label>
            {t.plant.light}:
            <Icon name="light" size={18} />
          </Label>
          <Text>{tr(current.light, current.lightHe)}</Text>
        </Row>
        <Row>
          <Label>
            {t.plant.water}:
            <Drops aria-hidden>
              {Array.from({ length: current.waterLevel }, (_, i) => (
                <Icon key={i} name="drop" size={16} />
              ))}
            </Drops>
          </Label>
          <Text>{tr(current.water, current.waterHe)}</Text>
        </Row>
        <Row>
          <Label>
            {t.plant.food}:
            <Icon name="food" size={18} />
          </Label>
          <Text>{tr(current.food, current.foodHe)}</Text>
        </Row>
      </Rows>
      {footer && <Footer>{footer}</Footer>}
    </Root>
  )
}
