import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { LevelBadge } from './LevelBadge'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ display: 'flex', gap: 24, padding: 24, background: '#FFFEFA' }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/LevelBadge',
  component: LevelBadge,
  decorators: [withApp],
}

const owner = { name: 'Maya Levi', color: '#1FA85A' }

export const Sizes = () => (
  <>
    <LevelBadge level={3} progress={0.4} owner={owner} />
    <LevelBadge level={3} progress={0.4} owner={owner} size="sm" />
    <LevelBadge level={12} progress={0.9} size="sm" />
  </>
)
