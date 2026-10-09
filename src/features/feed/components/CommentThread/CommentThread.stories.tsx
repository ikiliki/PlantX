import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import type { FeedUpdate } from '../../../../mock/types'
import { CommentThread } from './CommentThread'

const update: FeedUpdate = {
  id: 'story-comments',
  kind: 'photo',
  userId: 'u-maya',
  body: 'New leaf on the monstera',
  bodyHe: 'עלה חדש במונסטרה',
  createdAt: '2026-10-09T08:00:00.000Z',
  comments: 0,
}

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ width: 380, maxWidth: '100%', padding: 16 }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Feed/CommentThread',
  component: CommentThread,
}

export const Empty = () => <CommentThread update={update} />
Empty.decorators = [withApp]
