import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { seedUpdates } from '../../../../mock/updates'
import { StoreProvider } from '../../../../mock/store'
import { FeedUpdate } from './FeedUpdate'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ display: 'grid', gap: 12, maxWidth: 560, padding: 24, background: '#F4F1E8' }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Feed/FeedUpdate',
  component: FeedUpdate,
  decorators: [withApp],
}

export const AllKinds = () => (
  <>
    {seedUpdates().map((update) => (
      <FeedUpdate key={update.id} update={update} />
    ))}
  </>
)
