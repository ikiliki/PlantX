import { useI18n } from '../../../../i18n/I18nProvider'
import type { Plant } from '../../../../mock/types'
import { greenhouseNeeds } from '../../greenhouseNeeds'
import { Action, Name, Root, Row, Rows, Title } from './GreenhouseToday.styles'

export function GreenhouseToday({
  plants,
  onWater,
  onRefresh,
}: {
  plants: Plant[]
  onWater: (plantId: string) => void
  onRefresh: (plantId: string) => void
}) {
  const { t, tr } = useI18n()
  const needs = greenhouseNeeds(plants).filter(
    (need): need is { kind: 'refresh' | 'water'; plant: Plant } => need.kind === 'refresh' || need.kind === 'water',
  )

  if (plants.length === 0 || needs.length === 0) return null

  return (
    <Root aria-label={t.greenhouse.todayTitle}>
      <Title>{t.greenhouse.todayTitle}</Title>
      <Rows>
        {needs.slice(0, 4).map((need) => {
          const name = tr(need.plant.title, need.plant.titleHe)
          const actionLabel = need.kind === 'water' ? t.greenhouse.todayWater : t.greenhouse.todayPhoto
          return (
            <Row key={`${need.kind}-${need.plant.id}`}>
              <Name title={name}>{name}</Name>
              <Action
                type="button"
                onClick={() => (need.kind === 'water' ? onWater(need.plant.id) : onRefresh(need.plant.id))}
              >
                {actionLabel}
              </Action>
            </Row>
          )
        })}
      </Rows>
    </Root>
  )
}
