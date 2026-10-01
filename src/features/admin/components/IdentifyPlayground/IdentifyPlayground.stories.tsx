import { useState, type ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import type { IdentifyMode, IdentifyRequestRecord } from '../../../../mock/types'
import { liveFallbackRecord, liveUnavailableRecord, mockMatchRecord } from '../../identifyFixtures'
import { IdentifyPlayground } from './IdentifyPlayground'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ maxWidth: 820 }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Admin/IdentifyPlayground',
  component: IdentifyPlayground,
  decorators: [withApp],
}

const photo = '/class-photos/pot-gold-a-l-mat.jpg'

function Playground({
  initialMode = 'mock',
  result = null,
  running = false,
  withPhoto = false,
}: {
  initialMode?: IdentifyMode
  result?: IdentifyRequestRecord | null
  running?: boolean
  withPhoto?: boolean
}) {
  const [mode, setMode] = useState<IdentifyMode>(initialMode)
  return (
    <IdentifyPlayground
      mode={mode}
      onModeChange={setMode}
      running={running}
      result={result}
      onRun={() => undefined}
      initialPhoto={withPhoto ? photo : ''}
    />
  )
}

export const Empty = () => <Playground />

export const MockReady = () => <Playground withPhoto />

export const LiveReady = () => <Playground initialMode="live" withPhoto />

export const Running = () => <Playground withPhoto running />

export const MockMatched = () => <Playground withPhoto result={mockMatchRecord} />

export const LiveFallback = () => <Playground initialMode="live" withPhoto result={liveFallbackRecord} />

export const LiveUnavailable = () => (
  <Playground initialMode="live" withPhoto result={liveUnavailableRecord} />
)
