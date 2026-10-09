import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import { FeedPost } from './FeedPost'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ width: 390, maxWidth: '100%', padding: 16 }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

function FirstPost() {
  const { db } = useStore()
  const update = (db.updates ?? []).find((item) => item.plantId)
  return update ? <FeedPost update={update} /> : null
}

export default {
  title: 'Feed/FeedPost',
  component: FeedPost,
}

export const WithPhoto = () => <FirstPost />
WithPhoto.decorators = [withApp]
