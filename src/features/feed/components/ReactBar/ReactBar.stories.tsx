import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import type { FeedUpdate } from '../../../../mock/types'
import { ReactBar } from './ReactBar'

const update: FeedUpdate = {
  id: 'story-post',
  kind: 'added',
  userId: 'u-maya',
  body: 'Golden pothos added',
  bodyHe: 'פוטוס זהוב נוסף',
  createdAt: '2026-10-09T08:00:00.000Z',
  reactions: 4,
  reacted: true,
  comments: 2,
}

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
  title: 'Feed/ReactBar',
  component: ReactBar,
}

export const Interactive = () => <ReactBar update={update} onComments={() => undefined} />
Interactive.decorators = [withApp]

export const ReadOnly = () => <ReactBar update={update} readOnly />
ReadOnly.decorators = [withApp]
