import type { ReactNode } from 'react'
import { useState } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import type { Diagnosis } from '../../../../mock/types'
import { PhotoIdentify } from './PhotoIdentify'

const SAMPLE_PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect fill="#E4EBD8" width="160" height="160"/><text x="50%" y="54%" text-anchor="middle" font-size="14" fill="#5D7C4E">plant</text></svg>`,
  )

export const matchedDiagnosis: Diagnosis = {
  provider: 'plantid',
  mode: 'mock',
  label: 'Monstera deliciosa',
  scientificName: 'Monstera deliciosa',
  commonNames: ['Swiss cheese plant'],
  probability: 0.91,
  isPlant: true,
  draft: {
    categoryId: 'aroids',
    subcategoryId: 'monstera',
    quality: 'A',
    size: 'M',
    stage: 'MATURE',
    traits: {},
  },
  tried: [],
}

export const notInCatalogDiagnosis: Diagnosis = {
  provider: 'plantnet',
  mode: 'live',
  label: 'Unknown fern',
  scientificName: 'Polypodiopsida',
  commonNames: [],
  probability: 0.62,
  isPlant: true,
  draft: {},
  tried: [],
}

export const notPlantDiagnosis: Diagnosis = {
  provider: 'plantid',
  mode: 'mock',
  label: 'cat',
  scientificName: '',
  commonNames: [],
  probability: 0.88,
  isPlant: false,
  draft: {},
  tried: [],
}

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ padding: 24, maxWidth: 480 }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/PhotoIdentify',
  component: PhotoIdentify,
  decorators: [withApp],
}

function Frame({
  phase,
  diagnosis,
  photo = SAMPLE_PHOTO,
}: {
  phase: 'idle' | 'identifying' | 'matched' | 'notInCatalog' | 'failed' | 'notPlant'
  diagnosis?: Diagnosis
  photo?: string
}) {
  const [src, setSrc] = useState(photo)
  return (
    <PhotoIdentify
      photo={src}
      onPhoto={setSrc}
      onDiagnosis={() => undefined}
      phase={phase}
      diagnosis={diagnosis}
    />
  )
}

export const Idle = () => <Frame phase="idle" photo="" />
export const Identifying = () => <Frame phase="identifying" />
export const Matched = () => <Frame phase="matched" diagnosis={matchedDiagnosis} />
export const NotInCatalog = () => <Frame phase="notInCatalog" diagnosis={notInCatalogDiagnosis} />
export const Failed = () => <Frame phase="failed" />
export const NotPlant = () => <Frame phase="notPlant" diagnosis={notPlantDiagnosis} />
