import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../features/auth/AuthProvider'
import { FeedUpdateSkeleton } from '../../features/feed/components/FeedUpdate/FeedUpdate'
import { I18nProvider } from '../../i18n/I18nProvider'
import { StoreProvider } from '../../mock/store'
import { GuestView } from '../GuestView/GuestView'
import { GuestCurtain } from './GuestCurtain'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <AuthProvider>
          <div style={{ width: 'min(640px, 100%)' }}>
            <Story />
          </div>
        </AuthProvider>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Components/GuestCurtain',
  component: GuestCurtain,
  decorators: [withApp],
}

const feed = (
  <>
    <FeedUpdateSkeleton kind="water" />
    <FeedUpdateSkeleton kind="added" />
    <FeedUpdateSkeleton kind="photo" />
  </>
)

export const Guest = () => (
  <GuestCurtain card={<GuestView card title="Log in to see what's growing" body="The feed is for members." action="Log in" />}>
    {feed}
  </GuestCurtain>
)

export const Loading = () => <GuestCurtain>{feed}</GuestCurtain>
