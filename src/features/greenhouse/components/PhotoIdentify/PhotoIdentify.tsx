import { useEffect, useRef, useState } from 'react'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { mockIdentify } from '../../../../mock/identifyMock'
import { postIdentify } from '../../../../mock/liveApi'
import { useStore } from '../../../../mock/store'
import type { Diagnosis, IdentifyProviderId } from '../../../../mock/types'
import { readPhoto, thumbPhoto } from '../../../../lib/readPhoto'
import { PhotoButton, PhotoCopy, Preview, Root, Status } from './PhotoIdentify.styles'

export type PhotoIdentifyPhase =
  | 'idle'
  | 'identifying'
  | 'matched'
  | 'notInCatalog'
  | 'failed'
  | 'notPlant'

const PROVIDER_LABEL: Record<IdentifyProviderId, string> = {
  plantid: 'Plant.id',
  plantnet: 'Pl@ntNet',
  gemini: 'Gemini',
}

function phaseFromDiagnosis(diagnosis: Diagnosis): Exclude<PhotoIdentifyPhase, 'idle' | 'identifying' | 'failed'> {
  if (!diagnosis.isPlant) return 'notPlant'
  if (!diagnosis.draft.categoryId && diagnosis.label) return 'notInCatalog'
  return 'matched'
}

export function PhotoIdentify({
  photo,
  onPhoto,
  onDiagnosis,
  phase: phaseProp,
  diagnosis: diagnosisProp,
}: {
  photo: string
  onPhoto: (dataUrl: string) => void
  onDiagnosis: (d: Diagnosis) => void
  /** Storybook: force a phase without calling the API. */
  phase?: PhotoIdentifyPhase
  /** Storybook: diagnosis fixture for matched / notInCatalog / notPlant copy. */
  diagnosis?: Diagnosis
}) {
  const { t } = useI18n()
  const { db, signedIn, liveWritable, plantxEnv } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const requestId = useRef(0)
  const [phase, setPhase] = useState<PhotoIdentifyPhase>('idle')
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)

  const activePhase = phaseProp ?? phase
  const activeDiagnosis = diagnosisProp ?? diagnosis

  useEffect(() => {
    if (phaseProp || photo) return
    setPhase('idle')
    setDiagnosis(null)
  }, [photo, phaseProp])

  const runIdentify = async (dataUrl: string) => {
    const uiMock = plantxEnv === 'mock'
    if (!signedIn || (!liveWritable && !uiMock)) {
      setPhase('idle')
      setDiagnosis(null)
      return
    }
    const id = ++requestId.current
    setPhase('identifying')
    setDiagnosis(null)
    const result = uiMock
      ? { ok: true as const, diagnosis: await mockIdentify(db.catalog) }
      : await postIdentify(dataUrl, await thumbPhoto(dataUrl))
    if (id !== requestId.current) return
    if (!result.ok) {
      setPhase('failed')
      setDiagnosis(null)
      return
    }
    const next = phaseFromDiagnosis(result.diagnosis)
    setPhase(next)
    setDiagnosis(result.diagnosis)
    onDiagnosis(result.diagnosis)
  }

  const onPick = (file: File) => {
    void readPhoto(file).then((dataUrl) => {
      onPhoto(dataUrl)
      void runIdentify(dataUrl)
    })
  }

  const statusText = (() => {
    switch (activePhase) {
      case 'identifying':
        return t.greenhouse.identifying
      case 'matched': {
        if (!activeDiagnosis) return null
        const pct = Math.round(activeDiagnosis.probability * 100)
        return t.greenhouse.identifyMatched
          .replace('{label}', activeDiagnosis.label)
          .replace('{provider}', PROVIDER_LABEL[activeDiagnosis.provider])
          .replace('{pct}', String(pct))
      }
      case 'notInCatalog':
        if (!activeDiagnosis?.label) return null
        return t.greenhouse.identifyNotInCatalog.replace('{label}', activeDiagnosis.label)
      case 'failed':
        return t.greenhouse.identifyFailed
      case 'notPlant':
        return t.greenhouse.identifyNotPlant
      default:
        return null
    }
  })()

  const statusTone =
    activePhase === 'matched'
      ? 'ok'
      : activePhase === 'notInCatalog' || activePhase === 'identifying'
        ? 'warn'
        : activePhase === 'failed' || activePhase === 'notPlant'
          ? 'bad'
          : 'muted'

  return (
    <Root>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (!file) return
          onPick(file)
          event.target.value = ''
        }}
      />
      <PhotoButton type="button" onClick={() => fileRef.current?.click()} disabled={activePhase === 'identifying'}>
        <Preview>{photo ? <PlantImage src={photo} fallbackSrc={photo} alt="" /> : null}</Preview>
        <PhotoCopy>
          <strong>{t.greenhouse.addPhoto}</strong>
          <small>{t.greenhouse.addClassNote}</small>
        </PhotoCopy>
      </PhotoButton>
      {statusText ? <Status $tone={statusTone}>{statusText}</Status> : null}
    </Root>
  )
}
