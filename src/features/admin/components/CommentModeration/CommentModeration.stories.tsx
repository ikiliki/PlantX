import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { CommentModeration } from './CommentModeration'

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
  title: 'Admin/CommentModeration',
  component: CommentModeration,
}

/** Mock data has no server comments, so the section says comments live on the server. */
export const Mock = () => <CommentModeration />
Mock.decorators = [withApp]
