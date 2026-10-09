import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import type { FeedUpdate } from '../../../../mock/types'
import { CommentSheet } from './CommentSheet'

const update: FeedUpdate = {
  id: 'story-sheet',
  kind: 'water',
  userId: 'u-maya',
  body: 'Watered the calathea',
  bodyHe: 'הושקתה הקלתאה',
  createdAt: '2026-10-09T08:00:00.000Z',
}

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <Story />
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Feed/CommentSheet',
  component: CommentSheet,
}

export const Open = () => <CommentSheet update={update} onClose={() => undefined} />
Open.decorators = [withApp]
