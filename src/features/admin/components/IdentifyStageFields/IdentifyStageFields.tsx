import { Field, Select } from '../../../../components/Form/Form'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { IdentifyMockScenario, IdentifyResponseMode, IdentifyStepId } from '../../../../mock/types'
import { scenarioLabelKey } from '../../identifyLabels'
import { Root } from './IdentifyStageFields.styles'

const ALL: IdentifyMockScenario[] = ['match', 'notInCatalog', 'notPlant', 'error']

/** Ready or Mock, and the canned answer when Mock. The plant check calls a catalog match "is a plant". */
export function IdentifyStageFields({
  stage,
  response,
  scenario,
  scenarios = ALL,
  disabled,
  onResponse,
  onScenario,
}: {
  stage: IdentifyStepId
  response: IdentifyResponseMode
  scenario: IdentifyMockScenario
  scenarios?: IdentifyMockScenario[]
  disabled?: boolean
  onResponse: (response: IdentifyResponseMode) => void
  onScenario: (scenario: IdentifyMockScenario) => void
}) {
  const { t } = useI18n()
  const value = scenarios.includes(scenario) ? scenario : scenarios[0]

  return (
    <Root>
      <Field>
        {t.admin.apisResponse}
        <Select
          aria-label={t.admin.apisResponse}
          value={response}
          disabled={disabled}
          onChange={(event) => onResponse(event.target.value as IdentifyResponseMode)}
        >
          <option value="ready">{t.admin.apisResponseReady}</option>
          <option value="mock">{t.admin.apisResponseMock}</option>
        </Select>
      </Field>
      {response === 'mock' && (
        <Field>
          {t.admin.apisScenario}
          <Select
            aria-label={t.admin.apisScenario}
            value={value}
            disabled={disabled}
            onChange={(event) => onScenario(event.target.value as IdentifyMockScenario)}
          >
            {scenarios.map((id) => (
              <option key={id} value={id}>
                {stage === 'gate' && id === 'match' ? t.admin.apisScenarioIsPlant : t.admin[scenarioLabelKey[id]]}
              </option>
            ))}
          </Select>
        </Field>
      )}
    </Root>
  )
}
