import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { ReactionTable } from './ReactionTable'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ padding: 16 }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Admin/ReactionTable',
  component: ReactionTable,
}

/** Mock data has no server reactions, so the section says they live on the server. */
export const Mock = () => <ReactionTable />
Mock.decorators = [withApp]
