import { useRef, useState, type FormEvent } from 'react'
import { Button } from '../../../../components/Button/Button'
import { Field, FormRow, Select } from '../../../../components/Form/Form'
import { Segmented } from '../../../../components/Segmented/Segmented'
import { useI18n } from '../../../../i18n/I18nProvider'
import { readPhoto, thumbPhoto } from '../../../../lib/readPhoto'
import type {
  IdentifyMockScenario,
  IdentifyMode,
  IdentifyRequestRecord,
  IdentifyTarget,
  IdentifyTestRequest,
} from '../../../../mock/types'
import {
  identifyScenarios,
  identifyTargets,
  modeHintKey,
  modeLabelKey,
  scenarioLabelKey,
  targetLabelKey,
} from '../../identifyLabels'
import { AdminSection } from '../AdminSection/AdminSection'
import { IdentifyResult } from '../IdentifyResult/IdentifyResult'
import { Actions, Empty, Form, Hint, Output, PhotoRow, Preview } from './IdentifyPlayground.styles'

const modes: IdentifyMode[] = ['mock', 'live']

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
    onRun({
      image: photo,
      thumb: thumb || undefined,
      mode,
      target,
      scenario: mode === 'mock' ? scenario : undefined,
    })
  }

  return (
    <AdminSection title={t.admin.apisPlayground} lead={t.admin.apisPlaygroundLead}>
      <Form onSubmit={onSubmit}>
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

        <FormRow>
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
        </FormRow>

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
