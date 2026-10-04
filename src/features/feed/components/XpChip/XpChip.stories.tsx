import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { XpChip } from './XpChip'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ display: 'flex', gap: 12, padding: 24 }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Feed/XpChip',
  component: XpChip,
  decorators: [withApp],
}

/** A new plant, then completed care. A scan earns none, so it shows nothing. */
export const Kinds = () => (
  <>
    <XpChip kind="added" />
    <XpChip kind="water" />
    <XpChip kind="scan" />
  </>
)
