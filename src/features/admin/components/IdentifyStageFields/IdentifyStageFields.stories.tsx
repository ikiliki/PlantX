import { useState, type ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import type { IdentifyMockScenario, IdentifyResponseMode } from '../../../../mock/types'
import { IdentifyStageFields } from './IdentifyStageFields'

const withI18n = (Story: () => ReactNode) => (
  <I18nProvider>
    <Story />
  </I18nProvider>
)

export default {
  title: 'Features/Admin/IdentifyStageFields',
  component: IdentifyStageFields,
  decorators: [withI18n],
}

function Fields({
  stage = 'draft',
  initialResponse = 'mock',
  scenarios,
}: {
  stage?: 'gate' | 'species' | 'draft'
  initialResponse?: IdentifyResponseMode
  scenarios?: IdentifyMockScenario[]
}) {
  const [response, setResponse] = useState<IdentifyResponseMode>(initialResponse)
  const [scenario, setScenario] = useState<IdentifyMockScenario>('match')
  return (
    <IdentifyStageFields
      stage={stage}
      response={response}
      scenario={scenario}
      scenarios={scenarios}
      onResponse={setResponse}
      onScenario={setScenario}
    />
  )
}

export const PlantCheck = () => <Fields stage="gate" scenarios={['match', 'notPlant', 'error']} />

export const CatalogFields = () => <Fields stage="draft" />

export const Ready = () => <Fields initialResponse="ready" />
