import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { AiScan, type AiScanFact } from './AiScan'

const PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><rect fill="#24543F" width="320" height="320"/><ellipse cx="160" cy="170" rx="90" ry="110" fill="#5D7C4E"/><path d="M160 60 L160 280" stroke="#CFEA78" stroke-width="4"/></svg>`,
  )

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
  title: 'Features/Greenhouse/AiScan',
  component: AiScan,
  decorators: [withApp],
}

const facts: AiScanFact[] = [
  { id: 'species', label: 'Species', value: 'Swiss cheese plant' },
  { id: 'scientific', label: 'Scientific name', value: 'Monstera deliciosa' },
  { id: 'category', label: 'Category', value: 'Monstera' },
  { id: 'subcategory', label: 'Subcategory', value: 'Deliciosa' },
]

export const Scanning = () => <AiScan photo={PHOTO} state="scanning" />

export const Answered = () => (
  <AiScan
    photo={PHOTO}
    state="answered"
    facts={facts}
    provider="plantid"
    probability={0.93}
    mode="live"
  />
)

export const AnsweredAfterFallback = () => (
  <AiScan
    photo={PHOTO}
    state="answered"
    facts={facts.slice(0, 3)}
    provider="gemini"
    probability={0.78}
    mode="mock"
    tried={[
      { provider: 'plantid', reason: 'exhausted' },
      { provider: 'plantnet', reason: 'timeout' },
    ]}
  />
)

export const Unverified = () => (
  <AiScan
    photo={PHOTO}
    state="unverified"
    tried={[
      { provider: 'plantid', reason: 'missingKey' },
      { provider: 'plantnet', reason: 'error' },
      { provider: 'gemini', reason: 'disabled' },
    ]}
  />
)

export const NarrowFrame = () => (
  <div style={{ width: 320 }}>
    <AiScan photo={PHOTO} state="answered" facts={facts} provider="plantnet" probability={0.81} mode="live" />
  </div>
)
