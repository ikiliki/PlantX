import type { ReactNode } from 'react'
import { useState } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import type { Diagnosis, IdentifyTried, PhotoCheck } from '../../../../mock/types'
import { MAX_PLANT_PHOTOS } from '../../identification'
import { PhotoIdentify, type PhotoIdentifyPhase, type PhotoScan } from './PhotoIdentify'

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
      <div style={{ padding: 24, maxWidth: 680 }}>
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

function scan(id: string, phase: PhotoIdentifyPhase, diagnosis?: Diagnosis, tried?: IdentifyTried[]): PhotoScan {
  return { id, photo: SAMPLE_PHOTO, phase, diagnosis, tried: tried ?? diagnosis?.tried }
}

function Frame({
  initial,
  checks,
  max,
  analyze,
}: {
  initial: PhotoScan[]
  checks?: PhotoCheck[]
  max?: number
  analyze?: boolean
}) {
  const [scans, setScans] = useState(initial)
  return <PhotoIdentify scans={scans} onScansChange={setScans} checks={checks} max={max} analyze={analyze} />
}

export const Idle = () => <Frame initial={[]} />
/** Product upload cap. Multi-photo stories still pass a higher `max`. */
export const OnePhoto = () => <Frame initial={[]} max={1} />
export const Held = () => <Frame initial={[scan('a', 'held')]} analyze={false} />
export const Identifying = () => <Frame initial={[scan('a', 'identifying')]} />
export const Matched = () => (
  <Frame
    initial={[scan('a', 'matched', matchedDiagnosis)]}
    checks={[{ position: 0, result: 'match', provider: 'plantid', mode: 'mock', probability: 0.91 }]}
  />
)
export const ThreePhotos = () => (
  <Frame
    max={MAX_PLANT_PHOTOS}
    initial={[
      scan('a', 'matched', matchedDiagnosis),
      scan('b', 'notPlant', notPlantDiagnosis),
      scan('c', 'identifying'),
    ]}
    checks={[
      { position: 0, result: 'match', provider: 'plantid', mode: 'mock', probability: 0.91 },
      { position: 1, result: 'notPlant', provider: 'plantid', mode: 'mock' },
    ]}
  />
)
export const NotInCatalog = () => <Frame initial={[scan('a', 'notInCatalog', notInCatalogDiagnosis)]} />
export const Failed = () => (
  <Frame
    initial={[
      scan('a', 'failed', undefined, [
        { provider: 'plantid', reason: 'exhausted' },
        { provider: 'plantnet', reason: 'timeout' },
        { provider: 'gemini', reason: 'error' },
      ]),
    ]}
    checks={[{ position: 0, result: 'failed' }]}
  />
)
export const NotPlant = () => <Frame initial={[scan('a', 'notPlant', notPlantDiagnosis)]} />
export const NoAccess = () => <Frame initial={[scan('a', 'noAccess')]} />
