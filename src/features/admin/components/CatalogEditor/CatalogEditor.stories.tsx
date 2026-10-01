import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { Shell } from './CatalogEditor.styles'
import { CatalogEditor } from './CatalogEditor'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ padding: 24, maxWidth: 960 }}>
        <Shell>
          <Story />
        </Shell>
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Admin/CatalogEditor',
  component: CatalogEditor,
  decorators: [withApp],
}

export const Default = () => <CatalogEditor />
