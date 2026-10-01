import { useI18n } from '../../i18n/I18nProvider'
import { seasonalCareFor } from '../../mock/seasonalCare'
import type { GrowingConditions, GrowthTime } from '../../mock/types'
import { SeasonalCare } from '../SeasonalCare/SeasonalCare'
import { Label, Line, Note, Root, Value } from './GrowingNotes.styles'

export function GrowingNotes({
  growthTime,
  conditions,
  speciesId,
  hideHeading,
}: {
  growthTime?: GrowthTime
  conditions?: GrowingConditions
  /** When the species has seasonal care, it replaces the single light/water line. */
  speciesId?: string
  hideHeading?: boolean
}) {
  const { t, tr } = useI18n()
  const seasonal = seasonalCareFor(speciesId)

  if (seasonal) {
    const hasFooter = growthTime || conditions?.note
    return (
      <SeasonalCare
        care={seasonal}
        hideHeading={hideHeading}
        footer={
          hasFooter && (
            <>
              {growthTime && (
                <span>
                  <strong>{t.plant.growthTime}:</strong> {tr(growthTime.en, growthTime.he)}
                </span>
              )}
              {conditions?.note && <span>{tr(conditions.note, conditions.noteHe)}</span>}
            </>
          )
        }
      />
    )
  }

  if (!growthTime && !conditions) return null

  return (
    <Root>
      {growthTime && (
        <Line>
          <Label>{t.plant.growthTime}</Label>
          <Value>{tr(growthTime.en, growthTime.he)}</Value>
        </Line>
      )}
      {conditions && (
        <>
          <Line>
            <Label>{t.plant.light}</Label>
            <Value>{tr(conditions.light, conditions.lightHe)}</Value>
          </Line>
          <Line>
            <Label>{t.plant.water}</Label>
            <Value>{tr(conditions.water, conditions.waterHe)}</Value>
          </Line>
          <Note>{tr(conditions.note, conditions.noteHe)}</Note>
        </>
      )}
    </Root>
  )
}
