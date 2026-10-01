import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../i18n/I18nProvider'
import { StoreProvider } from '../../mock/store'
import { FeatureGate } from './FeatureGate'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

function SamplePanel() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 8,
        padding: 48,
        borderRadius: 16,
        border: '1px solid #DCE1D8',
        background: '#FFFEFA',
      }}
    >
      <strong>Market table</strong>
      <span>POT-GOLD-A-M-R · ₪120</span>
      <span>MON-STD-A-L-MAT · ₪340</span>
    </div>
  )
}

export default {
  title: 'Components/FeatureGate',
  component: FeatureGate,
  decorators: [withApp],
}

export const ComingSoon = () => (
  <FeatureGate placement="market.board" title="Market">
    <SamplePanel />
  </FeatureGate>
)

export const ReadyGreenhouse = () => (
  <FeatureGate placement="greenhouse.board" title="Greenhouse">
    <SamplePanel />
  </FeatureGate>
)
