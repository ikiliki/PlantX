import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import type { FeedUpdate } from '../../../../mock/types'
import { CommentPreview } from './CommentPreview'

const base: FeedUpdate = {
  id: 'story-preview',
  kind: 'photo',
  userId: 'u-maya',
  body: 'New leaf on the monstera',
  bodyHe: 'עלה חדש במונסטרה',
  createdAt: '2026-10-09T08:00:00.000Z',
  comments: 0,
}

const comment = (id: string, userId: string, body: string) => ({
  id,
  activityId: base.id,
  userId,
  body,
  createdAt: '2026-10-09T09:00:00.000Z',
})

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
  title: 'Feed/CommentPreview',
  component: CommentPreview,
  decorators: [withApp],
}

export const NoComments = () => <CommentPreview update={base} onViewAll={() => {}} />

export const TwoOfFive = () => (
  <CommentPreview
    update={{
      ...base,
      comments: 5,
      latestComments: [comment('c1', 'u-daniel', 'That fenestration!'), comment('c2', 'u-gal', 'Mine is sulking, any tips?')],
    }}
    onViewAll={() => {}}
  />
)
