import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { FeedSuggestion } from './FeedSuggestion'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ width: 390, maxWidth: '100%', padding: 16, display: 'grid', gap: 16 }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Feed/FeedSuggestion',
  component: FeedSuggestion,
}

export const All = () => (
  <>
    <FeedSuggestion kind="tip" />
    <FeedSuggestion kind="rank" />
    <FeedSuggestion kind="market" />
  </>
)
All.decorators = [withApp]
