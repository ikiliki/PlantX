import { useRef, useState, type FormEvent } from 'react'
import { Button } from '../../../../components/Button/Button'
import { Field, Select } from '../../../../components/Form/Form'
import { Segmented } from '../../../../components/Segmented/Segmented'
import { useI18n } from '../../../../i18n/I18nProvider'
import { readPhoto, thumbPhoto } from '../../../../lib/readPhoto'
import type {
  IdentifyMockScenario,
  IdentifyMode,
  IdentifyRequestRecord,
  IdentifyResponseMode,
  IdentifyStageRun,
  IdentifyStepId,
  IdentifyTarget,
  IdentifyTestRequest,
} from '../../../../mock/types'
import {
  identifyScenarios,
  identifyTargets,
  modeHintKey,
  modeLabelKey,
  scenarioLabelKey,
  stepLabelKey,
  targetLabelKey,
} from '../../identifyLabels'
import { IdentifyStageFields } from '../IdentifyStageFields/IdentifyStageFields'
import { AdminSection } from '../AdminSection/AdminSection'
import { IdentifyResult } from '../IdentifyResult/IdentifyResult'
import { Actions, Empty, Form, Hint, Output, PhotoRow, Preview, Stage, Stages } from './IdentifyPlayground.styles'

const modes: IdentifyMode[] = ['mock', 'live']
const pipelineStages: IdentifyStepId[] = ['gate', 'species', 'draft']
const gateScenarios: IdentifyMockScenario[] = ['match', 'notPlant', 'error']

function freshStages(): Record<IdentifyStepId, IdentifyStageRun> {
  return {
    gate: { response: 'mock', scenario: 'match' },
    species: { response: 'mock', scenario: 'match' },
    draft: { response: 'mock', scenario: 'match' },
  }
}

export function IdentifyPlayground({
  mode,
  onModeChange,
  running = false,
  result,
  error,
  onRun,
  initialPhoto = '',
}: {
  mode: IdentifyMode
  onModeChange: (mode: IdentifyMode) => void
  running?: boolean
  result: IdentifyRequestRecord | null
  error?: string
  onRun: (request: IdentifyTestRequest) => void
  /** Storybook: start with a photo already picked. */
  initialPhoto?: string
}) {
  const { t } = useI18n()
  const fileRef = useRef<HTMLInputElement>(null)
  const [target, setTarget] = useState<IdentifyTarget>('chain')
  const [scenario, setScenario] = useState<IdentifyMockScenario>('match')
  const [stages, setStages] = useState(freshStages)
  const [photo, setPhoto] = useState(initialPhoto)
  const [thumb, setThumb] = useState('')

  const onPick = async (file: File) => {
    const image = await readPhoto(file)
    setPhoto(image)
    setThumb(await thumbPhoto(image))
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!photo || running) return
    const pipeline = target === 'chain'
    const anyLive = pipelineStages.some((id) => stages[id].response === 'ready')
    onRun({
      image: photo,
      thumb: thumb || undefined,
      mode: pipeline ? (anyLive ? 'live' : 'mock') : mode,
      target,
      scenario: !pipeline && mode === 'mock' ? scenario : undefined,
      stages: pipeline ? stages : undefined,
    })
  }

  return (
    <AdminSection title={t.admin.apisPlayground} lead={t.admin.apisPlaygroundLead}>
      <Form onSubmit={onSubmit}>
        <Field>
          {t.admin.apisTarget}
          <Select
            value={target}
            disabled={running}
            onChange={(event) => setTarget(event.target.value as IdentifyTarget)}
          >
            {identifyTargets.map((id) => (
              <option key={id} value={id}>
                {t.admin[targetLabelKey[id]]}
              </option>
            ))}
          </Select>
        </Field>

        {target === 'chain' ? (
          <Stages>
            {pipelineStages.map((id) => (
              <Stage key={id}>
                <strong>{t.admin[stepLabelKey[id]]}</strong>
                <IdentifyStageFields
                  stage={id}
                  response={stages[id].response}
                  scenario={stages[id].scenario}
                  scenarios={id === 'gate' ? gateScenarios : identifyScenarios}
                  disabled={running}
                  onResponse={(response: IdentifyResponseMode) =>
                    setStages((current) => ({ ...current, [id]: { ...current[id], response } }))
                  }
                  onScenario={(next) =>
                    setStages((current) => ({ ...current, [id]: { ...current[id], scenario: next } }))
                  }
                />
              </Stage>
            ))}
            {pipelineStages.some((id) => stages[id].response === 'ready') && (
              <Hint $warn role="alert">
                {t.admin.apisModeLiveHint}
              </Hint>
            )}
          </Stages>
        ) : (
          <>
            <Field as="div">
              {t.admin.apisMode}
              <Segmented
                ariaLabel={t.admin.apisMode}
                value={mode}
                disabled={running}
                onChange={onModeChange}
                options={modes.map((id) => ({ id, label: t.admin[modeLabelKey[id]] }))}
              />
              <Hint $warn={mode === 'live'} role={mode === 'live' ? 'alert' : undefined}>
                {t.admin[modeHintKey[mode]]}
              </Hint>
            </Field>
            {mode === 'mock' && (
              <Field>
                {t.admin.apisScenario}
                <Select
                  value={scenario}
                  disabled={running}
                  onChange={(event) => setScenario(event.target.value as IdentifyMockScenario)}
                >
                  {identifyScenarios.map((id) => (
                    <option key={id} value={id}>
                      {t.admin[scenarioLabelKey[id]]}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
          </>
        )}

        <Field as="div">
          {t.admin.apisPhoto}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void onPick(file)
              event.target.value = ''
            }}
          />
          <PhotoRow>
            {photo && (
              <Preview>
                <img src={photo} alt="" />
              </Preview>
            )}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={running}
              onClick={() => fileRef.current?.click()}
            >
              {t.admin.apisPickPhoto}
            </Button>
          </PhotoRow>
        </Field>

        <Actions>
          <Button type="submit" disabled={!photo || running}>
            {running ? t.admin.apisRunning : t.admin.apisRun}
          </Button>
        </Actions>
      </Form>

      <Output aria-live="polite">
        <Field as="div">{t.admin.apisResult}</Field>
        {result ? (
          <IdentifyResult record={result} error={error} />
        ) : (
          <Empty>{running ? t.admin.apisRunning : t.admin.apisResultEmpty}</Empty>
        )}
      </Output>
    </AdminSection>
  )
}
